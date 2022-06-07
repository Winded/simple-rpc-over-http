import { createServer } from "http";
import { Notes } from "simple-rpc-over-http-example-shared";
import { Config, processRequest, ResponseMetadata } from "simple-rpc-over-http-server";

// In a real application, this would be a database or cache service instead :)
let noteStorage: Notes.Note[] = [];
let lastInsertedId = 0;

class NotesService implements Notes.Service {
    constructor(private responseMetadata: ResponseMetadata) { }

    async getNotes(): Promise<Notes.Note[]> {
        return noteStorage;
    }
    async addNote(title: string, description: string, color: Notes.Color): Promise<Notes.Note> {
        const note: Notes.Note = {
            id: ++lastInsertedId,
            title: title,
            description: description,
            color: color
        };
        noteStorage.push(note);
        return note;
    }
    async removeNote(id: number): Promise<void> {
        const note = noteStorage.findIndex(note => note.id == id);
        if (note == -1) {
            this.responseMetadata.statusCode = 400;
            throw "Note not found";
        }

        noteStorage = [
            ...noteStorage.slice(0, note),
            ...noteStorage.slice(note + 1)
        ];
    }
}


const server = createServer((req, res) => {
    let responseMetadata: ResponseMetadata = {};
    const rpcConfig: Config = {
        services: {
            notes: new NotesService(responseMetadata)
        }
    };

    processRequest(req, res, rpcConfig, responseMetadata);
});

server.listen(8081);
