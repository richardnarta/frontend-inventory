import { useState, useEffect } from 'react';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { UserItem, UserCreateRequest, UserUpdateRequest } from '@/model/user';
import type { UserRole } from '@/model/auth';

interface UserFormDialogProps {
    editingUser?: UserItem;
    isRoot: boolean;
    isSaving: boolean;
    onSave: (data: UserCreateRequest | UserUpdateRequest) => void;
    onClose: () => void;
}

export function UserFormDialog({
    editingUser,
    isRoot,
    isSaving,
    onSave,
    onClose,
}: UserFormDialogProps) {
    const isEdit = !!editingUser;

    const [nama, setNama] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('staff');

    // Role options: root can assign admin or staff; admin can only assign staff
    const roleOptions: { value: UserRole; label: string }[] = isRoot
        ? [
            { value: 'admin', label: 'Admin' },
            { value: 'staff', label: 'Staff' },
        ]
        : [{ value: 'staff', label: 'Staff' }];

    useEffect(() => {
        if (editingUser) {
            setNama(editingUser.nama);
            setUsername(editingUser.username);
            setRole(editingUser.role === 'root' ? 'admin' : editingUser.role);
            setPassword('');
        } else {
            setNama('');
            setUsername('');
            setPassword('');
            setRole('staff');
        }
    }, [editingUser]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            const update: UserUpdateRequest = {
                ...(nama !== editingUser?.nama && { nama }),
                ...(role !== editingUser?.role && { role }),
                ...(password && { password }),
            };
            onSave(update);
        } else {
            const create: UserCreateRequest = { nama, username, password, role };
            onSave(create);
        }
    };

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{isEdit ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <div className="space-y-1">
                    <Label htmlFor="u-nama">Nama Lengkap</Label>
                    <Input
                        id="u-nama"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Nama lengkap..."
                        required
                    />
                </div>

                {!isEdit && (
                    <div className="space-y-1">
                        <Label htmlFor="u-username">Username</Label>
                        <Input
                            id="u-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username..."
                            required
                        />
                    </div>
                )}

                <div className="space-y-1">
                    <Label htmlFor="u-password">
                        {isEdit ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
                    </Label>
                    <Input
                        id="u-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password..."
                        required={!isEdit}
                    />
                </div>

                {/* Don't allow changing role of root user */}
                {editingUser?.role !== 'root' && (
                    <div className="space-y-1">
                        <Label htmlFor="u-role">Role</Label>
                        <Select
                            value={role}
                            onValueChange={(v) => setRole(v as UserRole)}
                        >
                            <SelectTrigger id="u-role">
                                <SelectValue placeholder="Pilih role..." />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        className="bg-green-400 hover:bg-green-500 text-gray-900"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan'
                        )}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
