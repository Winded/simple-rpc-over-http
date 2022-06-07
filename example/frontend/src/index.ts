import { buildService } from 'simple-rpc-over-http-client';
import { Notes } from 'simple-rpc-over-http-example-shared';
import { distinct, map, Subject } from 'rxjs';

import './style.css';
import produce from 'immer';

interface State {
    notes: Notes.Note[];
    error?: string;
};

let currentState: State = {
    notes: []
};
const stateChange = new Subject<Readonly<State>>();
function updateState(func: (state: Readonly<State>) => State) {
    currentState = func(currentState);
    stateChange.next(currentState);
}

const noteService = buildService<Notes.Service>({
    url: 'http://localhost:8081',
    serviceName: 'notes'
});

const colorValues: {[k: string]: Notes.Color} = {
    red: Notes.Color.Red,
    green: Notes.Color.Green,
    blue: Notes.Color.Blue,
};

function onError(error: any) {
    let sError = typeof error == "string" ? error : 'Unknown error';
    updateState(produce(state => {
        state.error = sError;
    }));
}

function configureNoteList() {
    const list = document.querySelector('ul');

    stateChange.pipe(
        map(state => state.notes),
        distinct()
    ).subscribe(notes => {
        while (list.hasChildNodes()) {
            list.lastChild.remove();
        }
        for (let note of notes) {
            const item = document.createElement('li');
            switch (note.color) {
                case Notes.Color.Red:
                    item.setAttribute('style', 'color:red;');
                    break;
                case Notes.Color.Green:
                    item.setAttribute('style', 'color:green;');
                    break;
                case Notes.Color.Blue:
                    item.setAttribute('style', 'color:blue;');
                    break;
            }
            item.innerHTML = `${note.title} [<a href="javascript:void(0)">X</a>]`;
            item.querySelector('a').addEventListener('click', () => {
                noteService.removeNote(note.id).then(() => {
                    updateState(produce(state => {
                        state.notes = state.notes.filter(n => n.id != note.id);
                    }));
                }).catch(onError);
            });
            list.appendChild(item);
        }
    });

    noteService.getNotes().then(notes => {
        updateState(produce(state => {
            state.notes = notes;
        }));
    }).catch(onError);
}

function configureTaskForm() {
    const form: HTMLFormElement = document.querySelector('form');
    
    const errorLabel = form.querySelector('p');
    stateChange.pipe(
        map(state => state.error),
        distinct()
    ).subscribe(error => {
        if (error) {
            errorLabel.removeAttribute('hidden');
        } else {
            errorLabel.setAttribute('hidden', '1');
        }
        errorLabel.innerText = error ?? '';
    });
    
    form.addEventListener('submit', e => {
        e.preventDefault();

        const title = (<HTMLInputElement>(<unknown>form.title)).value;
        const description = form.description.value;
        const color = colorValues[(<HTMLSelectElement>form.color).value] ?? Notes.Color.Blue;

        noteService.addNote(title, description, color).then(note => {
            updateState(produce(state => {
                state.notes.push(note);
            }));
        }).catch(onError);
    });
}

configureNoteList();
configureTaskForm();
