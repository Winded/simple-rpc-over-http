export declare namespace Notes {
    enum Color {
        Red = 0,
        Green = 1,
        Blue = 2
    }
    interface Note {
        id: number;
        title: string;
        description: string;
        color: Color;
    }
    interface Service {
        getNotes(): Promise<Note[]>;
        addNote(title: string, description: string, color: Color): Promise<void>;
        removeNote(id: number): Promise<void>;
    }
}
