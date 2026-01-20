'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

type ImageUploadProps = {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
    className?: string;
    previewClassName?: string;
    label?: string;
};

export default function ImageUpload({
    value,
    onChange,
    folder = 'uploads',
    className = '',
    previewClassName = 'h-20 w-20',
    label = 'Upload Image'
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // Get authentication parameters
            const authRes = await fetch('/api/imagekit/auth');
            if (!authRes.ok) {
                const authData = await authRes.json();
                throw new Error(authData.error || 'Failed to get upload credentials');
            }
            const { token, expire, signature } = await authRes.json();

            // Get ImageKit settings for publicKey and urlEndpoint
            const settingsRes = await fetch('/api/admin/settings');
            if (!settingsRes.ok) {
                throw new Error('Failed to get ImageKit settings');
            }
            const settings = await settingsRes.json();

            if (!settings.imagekit_publickey || !settings.imagekit_url) {
                throw new Error('ImageKit not configured');
            }

            // Create form data for upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('publicKey', settings.imagekit_publickey);
            formData.append('signature', signature);
            formData.append('expire', expire.toString());
            formData.append('token', token);
            formData.append('fileName', file.name);
            formData.append('folder', `/${folder}`);

            // Upload to ImageKit
            const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                throw new Error('Failed to upload image');
            }

            const uploadData = await uploadRes.json();
            onChange(uploadData.url);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
            />

            {value ? (
                <div className="relative inline-block">
                    <div className={`bg-slate-100 rounded-lg overflow-hidden ${previewClassName}`}>
                        <img
                            src={value}
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            <span className="text-xs text-slate-500">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-xs text-slate-500">{label}</span>
                        </>
                    )}
                </button>
            )}

            {error && (
                <p className="mt-2 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}
