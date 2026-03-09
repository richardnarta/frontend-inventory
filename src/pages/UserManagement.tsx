import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageHeading } from '@/components/PageHeading';
import { DeleteConfirmationDialog } from '@/components/DeleteDialog';
import { UserFormDialog } from '@/components/UserFormDialog';
import { getUsers, createUser, updateUser, deleteUser } from '@/service/user';
import { useRole } from '@/hooks/use-role';
import type { UserItem, UserCreateRequest, UserUpdateRequest } from '@/model/user';

const roleBadgeStyle: Record<string, string> = {
    root: 'bg-purple-100 text-purple-700 border-purple-300',
    admin: 'bg-blue-100 text-blue-700 border-blue-300',
    staff: 'bg-gray-100 text-gray-600 border-gray-300',
};

export const UserManagementPage = () => {
    const { isRoot, user: currentUser } = useRole();
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | undefined>(undefined);

    const { data: users = [], isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
    });

    const createMutation = useMutation({
        mutationFn: (data: UserCreateRequest) => createUser(data),
        onSuccess: () => {
            toast.success('User berhasil dibuat.');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsFormOpen(false);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UserUpdateRequest }) =>
            updateUser(id, data),
        onSuccess: () => {
            toast.success('User berhasil diperbarui.');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsFormOpen(false);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            toast.success('User berhasil dihapus.');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleSave = (data: UserCreateRequest | UserUpdateRequest) => {
        if (editingUser) {
            updateMutation.mutate({ id: editingUser.id, data: data as UserUpdateRequest });
        } else {
            createMutation.mutate(data as UserCreateRequest);
        }
    };

    const openAdd = () => {
        setEditingUser(undefined);
        setIsFormOpen(true);
    };

    const openEdit = (u: UserItem) => {
        setEditingUser(u);
        setIsFormOpen(true);
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading headingTitle="Manajemen User" actionButton={() => { }} />

            <div className="flex justify-end mb-4">
                <Button className="bg-orange-400 hover:bg-orange-500 text-gray-900" onClick={openAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah User
                </Button>
            </div>

            {isLoading ? (
                <div className="w-full h-40 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">
                    Gagal mengambil data user.
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-orange-200 hover:bg-orange-200">
                                <TableHead className="pl-6 py-4">Nama</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead className="text-center">Role</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                        Tidak ada user.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium pl-6">{u.nama}</TableCell>
                                        <TableCell className="font-mono text-sm">{u.username}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant="outline"
                                                className={roleBadgeStyle[u.role] ?? ''}
                                            >
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Cannot edit root unless you are root, cannot edit yourself for role */}
                                                {(u.role !== 'root' || isRoot) && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openEdit(u)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {/* Cannot delete yourself or root */}
                                                {u.id !== currentUser?.id && u.role !== 'root' && (
                                                    <DeleteConfirmationDialog
                                                        onConfirm={() => deleteMutation.mutate(u.id)}
                                                        title={`Hapus user "${u.nama}"?`}
                                                    >
                                                        <Button variant="destructive" size="icon">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </DeleteConfirmationDialog>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {isFormOpen && (
                <UserFormDialog
                    editingUser={editingUser}
                    isRoot={isRoot}
                    isSaving={isSaving}
                    onSave={handleSave}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </Dialog>
    );
};
