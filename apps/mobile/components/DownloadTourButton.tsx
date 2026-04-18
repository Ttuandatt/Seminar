import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Download, CheckCircle, Trash2 } from 'lucide-react-native';
import { SyncManager } from '../services/syncManager';
import { isTourDownloaded } from '../services/database';

interface Props {
    tourId: string;
    estimatedSize?: string;
    onDelete?: () => void;
}

export default function DownloadTourButton({ tourId, estimatedSize = '50-100 MB', onDelete }: Props) {
    const [status, setStatus] = useState<'IDLE' | 'DOWNLOADING' | 'COMPLETED'>('IDLE');
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        if (isTourDownloaded(tourId)) {
            setStatus('COMPLETED');
        }
    }, [tourId]);

    const handleDownload = async () => {
        if (status === 'DOWNLOADING') return;
        
        try {
            setStatus('DOWNLOADING');
            await SyncManager.downloadTourPackage(tourId, (p) => {
                setProgress({ current: p.current, total: p.total });
            });
            setStatus('COMPLETED');
        } catch (error) {
            console.error('Download failed', error);
            setStatus('IDLE');
            alert('Tải xuống thất bại. Vui lòng thử lại.');
        }
    };

    if (status === 'COMPLETED') {
        return (
            <View style={statusStyles.container}>
                <View style={statusStyles.info}>
                    <CheckCircle size={20} color="#22C55E" />
                    <Text style={statusStyles.text}>Đã có sẵn ngoại tuyến</Text>
                </View>
                {onDelete && (
                    <TouchableOpacity onPress={onDelete} style={statusStyles.deleteBtn}>
                        <Trash2 size={16} color="#EF4444" />
                        <Text style={statusStyles.deleteText}>Xóa</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    if (status === 'DOWNLOADING') {
        const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
        return (
            <View style={downloadStyles.container}>
                <View style={[downloadStyles.progressBar, { width: `${percent}%` }]} />
                <View style={downloadStyles.content}>
                    <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={downloadStyles.text}>Đang tải... {percent}% ({progress.current}/{progress.total} file)</Text>
                </View>
            </View>
        );
    }

    return (
        <TouchableOpacity style={idleStyles.container} onPress={handleDownload}>
            <Download size={20} color="#FFF" />
            <View style={idleStyles.content}>
                <Text style={idleStyles.title}>Tải Tour về máy</Text>
                <Text style={idleStyles.subtitle}>Dung lượng ước tính: {estimatedSize}</Text>
            </View>
        </TouchableOpacity>
    );
}

const idleStyles = StyleSheet.create({
    container: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        marginLeft: 12,
    },
    title: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
});

const downloadStyles = StyleSheet.create({
    container: {
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        height: 56,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    progressBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: '#3B82F6',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    text: {
        color: '#FFF',
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});

const statusStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        marginLeft: 8,
        color: '#374151',
        fontWeight: '600',
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteText: {
        marginLeft: 4,
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '500',
    },
});
