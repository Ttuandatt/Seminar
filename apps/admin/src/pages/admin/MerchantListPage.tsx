import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Store, Plus, Search, Eye, Edit, Trash2,
    Phone, MapPin, Loader2, AlertCircle
} from 'lucide-react';
import { merchantService, type Merchant } from '../../services/merchant.service';

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    INACTIVE: 'bg-slate-50 text-slate-700 ring-slate-600/20',
    LOCKED: 'bg-red-50 text-red-700 ring-red-600/20',
};

const MerchantListPage = () => {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchMerchants();
    }, []);

    const fetchMerchants = async () => {
        setLoading(true);
        try {
            const result = await merchantService.getAll({ search });
            setMerchants(result.data);
        } catch (err) {
            console.error('Failed to fetch merchants:', err);
            setError('Failed to load merchants.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchMerchants();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this merchant?')) return;
        try {
            await merchantService.delete(id);
            fetchMerchants(); // Refresh list to show updated status
        } catch (err) {
            alert('Failed to delete merchant');
        }
    };

    if (loading && merchants.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Merchants</h1>
                    <p className="text-sm text-slate-500">Manage shop owners and their accounts.</p>
                </div>
                <Link
                    to="/admin/merchants/new"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Merchant
                </Link>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or shop name..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
                <button type="submit" className="ml-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                    Search
                </button>
            </form>

            {/* Merchant Cards */}
            {merchants.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                    <Store className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No merchants found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-1">
                        Try adjusting your search or create a new merchant account.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {merchants.map((merchant) => (
                        <div key={merchant.id} className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-lg">
                                        {merchant.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {merchant.shopOwnerProfile?.shopName || merchant.fullName}
                                        </h3>
                                        <p className="text-xs text-slate-500">{merchant.email}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColors[merchant.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {merchant.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-slate-500 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700">Owner:</span>
                                    {merchant.fullName}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    {merchant.shopOwnerProfile?.phone || 'N/A'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="truncate">{merchant.shopOwnerProfile?.shopAddress || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
                                <Link to={`/admin/merchants/${merchant.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="View">
                                    <Eye className="h-4 w-4" />
                                </Link>
                                <Link to={`/admin/merchants/${merchant.id}/edit`} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors" title="Edit">
                                    <Edit className="h-4 w-4" />
                                </Link>
                                <button onClick={() => handleDelete(merchant.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Deactivate">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MerchantListPage;
