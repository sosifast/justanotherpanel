import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { IKContext, IKUpload } from 'imagekitio-react';

type SliderData = {
    id: number;
    name: string;
    slug: string;
    imagekit_url_banner: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    slider?: SliderData | null;
    mode: 'add' | 'edit';
};

const SliderModal = ({ isOpen, onClose, onSubmit, slider, mode }: Props) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        imagekit_url_banner: ''
    });
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<{ imagekit_publickey: string; imagekit_url: string } | null>(null);

    useEffect(() => {
        // Fetch settings for ImageKit credentials 
        // Ideally this should be passed as props or from context, but fetching here for simplicity
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings/public');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (e) {
                console.error("Failed to fetch settings", e);
            }
        };
        fetchSettings();
    }, [isOpen]); // Fetch when modal opens

    useEffect(() => {
        if (isOpen && slider && mode === 'edit') {
            setFormData({
                name: slider.name,
                slug: slider.slug,
                imagekit_url_banner: slider.imagekit_url_banner
            });
        } else if (isOpen && mode === 'add') {
            setFormData({
                name: '',
                slug: '',
                imagekit_url_banner: ''
            });
        }
    }, [isOpen, slider, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-generate slug from name if adding
        if (mode === 'add' && name === 'name') {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.slug || !formData.imagekit_url_banner) {
            toast.error('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onError = (err: any) => {
        console.log("Error", err);
        toast.error('Image upload failed');
    };

    const onSuccess = (res: any) => {
        console.log("Success", res);
        setFormData(prev => ({ ...prev, imagekit_url_banner: res.url }));
        toast.success('Image uploaded successfully');
    };

    const authenticatior = async () => {
        try {
            const response = await fetch('/api/imagekit/auth');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }
            const data = await response.json();
            const { signature, expire, token } = data;
            return { signature, expire, token };
        } catch (error: any) {
            throw new Error(`Authentication request failed: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">
                        {mode === 'add' ? 'Add New Slider' : 'Edit Slider'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Banner Image</label>

                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative group">
                            {formData.imagekit_url_banner ? (
                                <div className="relative">
                                    <img
                                        src={formData.imagekit_url_banner}
                                        alt="Preview"
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, imagekit_url_banner: '' }))}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40">
                                    {settings ? (
                                        <IKContext
                                            publicKey={settings.imagekit_publickey}
                                            urlEndpoint={settings.imagekit_url}
                                            authenticator={authenticatior}
                                        >
                                            <IKUpload
                                                onError={onError}
                                                onSuccess={onSuccess}
                                                style={{ display: 'none' }}
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-2">
                                                    <Upload className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">Click to upload</p>
                                                <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF</p>
                                            </label>
                                        </IKContext>
                                    ) : (
                                        <p className="text-sm text-red-500">Loading ImageKit settings...</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <input
                            type="hidden"
                            name="imagekit_url_banner"
                            value={formData.imagekit_url_banner}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Summer Sale"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Slug</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                placeholder="summer-sale"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                            {mode === 'add' ? 'Create Slider' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SliderModal;
