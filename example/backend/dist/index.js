"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const simple_rpc_over_http_server_1 = require("simple-rpc-over-http-server");
// In a real application, this would be a database or cache service instead :)
let noteStorage = [];
let lastInsertedId = 0;
class NotesService {
    constructor(responseMetadata) {
        this.responseMetadata = responseMetadata;
    }
    getNotes() {
        return __awaiter(this, void 0, void 0, function* () {
            return noteStorage;
        });
    }
    addNote(title, description, color) {
        return __awaiter(this, void 0, void 0, function* () {
            const note = {
                id: ++lastInsertedId,
                title: title,
                description: description,
                color: color
            };
            noteStorage.push(note);
            return note;
        });
    }
    removeNote(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const note = noteStorage.findIndex(note => note.id == id);
            if (note == -1) {
                this.responseMetadata.statusCode = 400;
                throw "Note not found";
            }
            noteStorage = [
                ...noteStorage.slice(0, note),
                ...noteStorage.slice(note + 1)
            ];
        });
    }
}
const server = (0, http_1.createServer)((req, res) => {
    let responseMetadata = {};
    const rpcConfig = {
        services: {
            notes: new NotesService(responseMetadata)
        }
    };
    (0, simple_rpc_over_http_server_1.processRequest)(req, res, rpcConfig, responseMetadata);
});
server.listen(8081);
