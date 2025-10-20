import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Loader2 } from "lucide-react";


interface DeleteConfirmationDialogProps {
    children: React.ReactNode;
    onConfirm: () => void;
    isDeleting?: boolean;
    title?: string;
    description?: string;
}


export const DeleteConfirmationDialog = ({
    children,
    onConfirm,
    isDeleting = false,
    title = "Apakah anda yakin ingin menghapus data ini?",
    description = "Aksi ini akan menghapus permanen data anda.",
}: DeleteConfirmationDialogProps) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                
                {/* --- PERBAIKAN MULAI DARI SINI --- */}
                {/* Bungkus Header dengan div ini.
                  - max-h-[60vh] membatasi tinggi konten (60% dari tinggi layar).
                  - overflow-y-auto akan menambahkan scrollbar jika kontennya lebih panjang.
                  - Anda bisa ganti [60vh] dengan nilai lain seperti [400px] atau [500px].
                */}
                <div className="max-h-[60vh] overflow-y-auto pr-6"> {/* pr-6 untuk memberi ruang scrollbar */}
                    <AlertDialogHeader>
                        {/* Kami juga tambahkan 'break-words' di sini 
                          untuk menangani teks panjang di judul 
                        */}
                        <AlertDialogTitle className="break-words"> 
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="break-words pt-2">
                            {description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </div>
                {/* --- PERBAIKAN SELESAI --- */}
                
                <AlertDialogFooter>
                    <AlertDialogCancel>Kembali</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};