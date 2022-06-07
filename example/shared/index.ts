export namespace Notes {
    export enum Color {
        Red,
        Green,
        Blue
    }

    export interface Note {
        id: number;
        title: string;
        description: string;
        color: Color;
    }

    export interface Service {
        getNotes(): Promise<Note[]>;
        addNote(title: string, description: string, color: Color): Promise<Note>;
        removeNote(id: number): Promise<void>;
    }
}
