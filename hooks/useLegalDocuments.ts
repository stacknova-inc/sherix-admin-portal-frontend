"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { legalApi, normalizeLegalDocuments } from "@/services/legal";
import type { LegalDocument } from "@/types";

export const legalDocumentsQueryKey = ["legal-documents"] as const;

export function useLegalDocuments() {
  return useQuery({
    queryKey: legalDocumentsQueryKey,
    queryFn: legalApi.list,
    retry: 2,
  });
}

export function useUploadLegalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      document,
      onUploadProgress,
    }: {
      document: File;
      onUploadProgress?: (percent: number) => void;
    }) => legalApi.upload(document, onUploadProgress),

    onSuccess: (uploadedDocument, variables) => {
      const normalized = normalizeLegalDocuments(uploadedDocument);
      const uploaded = normalized?.[0];

      const fallbackDocument: LegalDocument = {
        id: `local-${variables.document.name}-${variables.document.lastModified}-${Date.now()}`,
        documentName: variables.document.name,
        fileName: variables.document.name,
        fileType: variables.document.type,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const documentToInsert: LegalDocument = uploaded
        ? {
            ...fallbackDocument,
            ...uploaded,
            documentName:
              uploaded.documentName &&
              uploaded.documentName !== "Legal document"
                ? uploaded.documentName
                : fallbackDocument.documentName,

            fileName: uploaded.fileName ?? fallbackDocument.fileName,
            fileType: uploaded.fileType ?? fallbackDocument.fileType,
            uploadedAt:
              uploaded.uploadedAt ??
              uploaded.createdAt ??
              fallbackDocument.uploadedAt,
            updatedAt: uploaded.updatedAt ?? fallbackDocument.updatedAt,

            // 🔥 FORCE UNIQUE ID ALWAYS
            id:
              uploaded._id ??
              uploaded.id ??
              fallbackDocument.id,
          }
        : fallbackDocument;

      queryClient.setQueryData<LegalDocument[]>(
        legalDocumentsQueryKey,
        (current = []) => {
          // 🔥 DO NOT overwrite by ID anymore (this caused your bug)

          const safeDocument: LegalDocument = {
            ...documentToInsert,
            id:
              documentToInsert._id ??
              documentToInsert.id ??
              `upload-${Date.now()}-${Math.random()}`,
          };

          // 🔥 Only remove true duplicates (same file + same time)
          const filtered = current.filter((doc) => {
            return !(
              doc.fileName === safeDocument.fileName &&
              doc.fileType === safeDocument.fileType &&
              doc.uploadedAt === safeDocument.uploadedAt
            );
          });

          return [safeDocument, ...filtered];
        }
      );
    },
  });
}