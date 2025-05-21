import { z } from "zod";
const fileSchema = z.instanceof(File).refine((file) => file.size > 0, {
    message: "File is required",
});

export const createDocumentSchema = z.object({
    document_type: z.string().min(1, "Document type is required").nullable(),
    note: z.string().min(1, "Note is required").nullable(),
    file: fileSchema,
    client_list: z.string().nullable().default(null),
    case_list: z.string().nullable().default(null)
});

export type createDocumentSchema = z.infer<typeof createDocumentSchema>;
