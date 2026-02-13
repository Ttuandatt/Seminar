import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Store, Loader2, AlertCircle } from 'lucide-react';
import { merchantService } from '../../services/merchant.service';

const MerchantFormPage = ({ readOnly = false }: { readOnly?: boolean }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '', // Only for creation
        fullName: '',
        shopName: '',
        shopAddress: '',
        phone: '',
        status: 'ACTIVE',
    });

    useEffect(() => {
        if (isEditMode && id) {
            setPageLoading(true);
            merchantService.getOne(id)
                .then((merchant: any) => {
                    setFormData({
                        email: merchant.email,
                        password: '',
                        fullName: merchant.fullName,
                        shopName: merchant.shopOwnerProfile?.shopName || '',
                        shopAddress: merchant.shopOwnerProfile?.shopAddress || '',
                        phone: merchant.shopOwnerProfile?.phone || '',
                        status: merchant.status,
                    });
                })
                .catch(err => {
                    console.error(err);
                    setError('Failed to load merchant details.');
                })
                .finally(() => setPageLoading(false));
        }
    }, [id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditMode) {
                // Update
                const payload = {
                    fullName: formData.fullName,
                    shopName: formData.shopName,
                    shopAddress: formData.shopAddress,
                    phone: formData.phone,
                    status: formData.status,
                };
                await merchantService.update(id!, payload);
            } else {
                // Create
                await merchantService.create(formData);
            }
            alert(`Merchant ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/admin/merchants');
        } catch (err: any) {
            console.error('Save Merchant error:', err);
            const msg = err.response?.data?.message || 'Failed to save Merchant.';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {isEditMode ? (readOnly ? 'View Merchant' : 'Edit Merchant') : 'Create New Merchant'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Store className="h-4 w-4 text-blue-600" />
                        Account & Shop Details
                    </h2>

                    {/* Login Info */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isEditMode || readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                            />
                        </div>
                        {!isEditMode && !readOnly && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Password *</label>
                                <input name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">At least 6 characters.</p>
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                            <input name="fullName" value={formData.fullName} onChange={handleChange} required disabled={readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    {/* Shop Info */}
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name *</label>
                            <input name="shopName" value={formData.shopName} onChange={handleChange} required disabled={readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <input name="shopAddress" value={formData.shopAddress} onChange={handleChange} disabled={readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} disabled={readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                            />
                        </div>
                        {isEditMode && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Account Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60">
                                    <option value="ACTIVE">Active</option>
                                    <option value="LOCKED">Locked</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => navigate(-1)}
                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition-all">
                        {readOnly ? 'Back' : 'Cancel'}
                    </button>
                    {!readOnly && (
                        <button type="submit"
                            disabled={loading}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {loading ? 'Saving...' : (isEditMode ? 'Update Merchant' : 'Create Merchant')}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default MerchantFormPage;
