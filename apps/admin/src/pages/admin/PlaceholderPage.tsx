import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title }: { title: string }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="p-4 rounded-full bg-slate-100">
                <Construction className="h-12 w-12 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-500 max-w-sm">
                This feature is currently under development. Check back later!
            </p>
        </div>
    );
};

export default PlaceholderPage;
