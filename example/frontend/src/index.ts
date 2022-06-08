import { buildService } from 'simple-rpc-over-http-client';
import { Notes } from 'simple-rpc-over-http-example-shared';
import { distinct, map, Observable, Subject } from 'rxjs';

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

function createNoteElement(note: Notes.Note, onDelete: () => void): HTMLElement {
    const element = document.createElement('div');
    element.classList.add('note');
    element.innerHTML = `
        <div class="title"></div>
        <div class="delete-button">
            <a href="javascript:void(0)">X</a>
        </div>
        <div class="description"></div>
    `;

    const deleteBtn = element.querySelector('a');
    deleteBtn.addEventListener('click', event => {
        event.preventDefault();
        onDelete();
    });

    const titleElement = element.querySelector('div[class="title"]') as HTMLElement;
    const descriptionElement = element.querySelector('div[class="description"]') as HTMLElement;

    titleElement.innerText = note.title;
    descriptionElement.innerText = note.description;

    switch(note.color) {
        case Notes.Color.Red:
            element.classList.add('red');
            break;
        case Notes.Color.Green:
            element.classList.add('green');
            break;
        case Notes.Color.Blue:
            element.classList.add('blue');
            break;
    }

    return element;
}

function createNoteList(noteSource: Observable<Notes.Note[]>, onDeleteNote: (id: number) => void): HTMLElement {
    const element = document.createElement('div');
    element.classList.add('note-list');

    noteSource.subscribe(notes => {
        while (element.hasChildNodes()) {
            element.lastChild.remove();
        }
        for (let note of notes) {
            const item = createNoteElement(note, () => onDeleteNote(note.id));
            element.appendChild(item);
        }
    });

    return element;
}

function createNoteForm(errorSource: Observable<string>, onAddNote: (title: string, description: string, color: Notes.Color) => void): HTMLElement {
    const element = document.createElement('form');
    element.classList.add('note');
    element.innerHTML = `
        <input class="title" type="text" name="title" placeholder="Title" required/>
        <select class="color" name="color" required>
            <option value="">[Color]</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
        </select>
        <textarea class="description" name="description" placeholder="Description" required></textarea>
        <p hidden style="color: red;"></p>
        <input class="addtask" type="submit" value="Add task"/>
    `;
    
    const errorLabel = element.querySelector('p');
    errorSource.subscribe(error => {
        if (error) {
            errorLabel.removeAttribute('hidden');
        } else {
            errorLabel.setAttribute('hidden', '1');
        }
        errorLabel.innerText = error ?? '';
    });
    
    element.addEventListener('submit', e => {
        e.preventDefault();

        const title = (<HTMLInputElement>(<unknown>element.title)).value;
        const description = element.description.value;
        const color = colorValues[(<HTMLSelectElement>element.color).value] ?? Notes.Color.Blue;

        onAddNote(title, description, color);
    });

    return element;
}

const noteList = createNoteList(
    stateChange.pipe(map(state => state.notes), distinct()),
    id => {
        noteService.removeNote(id).then(() => {
            updateState(produce(state => {
                state.notes = state.notes.filter(note => note.id != id);
            }));
        }).catch(onError);
    }
);
const form = createNoteForm(
    stateChange.pipe(map(state => state.error), distinct()),
    (title, description, color) => {
        noteService.addNote(title, description, color).then(newNote => {
            updateState(produce(state => {
                state.notes.push(newNote);
            }));
        }).catch(onError);
    }
);
document.getElementById('app').append(noteList, form);

noteService.getNotes().then(notes => {
    updateState(produce(state => {
        state.notes = notes;
    }));
}).catch(onError);
