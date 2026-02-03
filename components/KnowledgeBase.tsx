import React, { useState } from 'react';
import { KnowledgeFile } from '../types';
import { FileText, UploadCloud, Trash2, Database, Loader2, CheckCircle } from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [files, setFiles] = useState<KnowledgeFile[]>([
    { id: '1', name: 'company_handbook.pdf', size: 2400000, status: 'ready' },
    { id: '2', name: 'api_docs_v2.md', size: 45000, status: 'ready' },
  ]);

  const handleUpload = () => {
    const newFile: KnowledgeFile = {
      id: Math.random().toString(),
      name: `upload_${new Date().getTime()}.txt`,
      size: 1024,
      status: 'uploading'
    };
    setFiles([...files, newFile]);

    // Simulate upload process
    setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === newFile.id ? {...f, status: 'processing'} : f));
        setTimeout(() => {
             setFiles(prev => prev.map(f => f.id === newFile.id ? {...f, status: 'ready'} : f));
        }, 1500);
    }, 1000);
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900">
       <div className="flex items-center gap-3 pb-6 border-b border-gray-200 dark:border-gray-800 mb-6">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
             <Database className="w-5 h-5" />
        </div>
        <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">知识库 (RAG)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">管理 ChromaDB 向量数据库中的文档切片</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Upload Area */}
          <div className="md:col-span-1">
             <div 
                onClick={handleUpload}
                className="h-48 md:h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer group bg-white dark:bg-gray-800/50"
             >
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:scale-110 transition-transform mb-3">
                    <UploadCloud className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">点击上传文档</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">支持 TXT, MD, PDF</p>
             </div>
             
             <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wide">关于 RAG</h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                    上传的文档会被自动切片 (Chunking) 并存入 ChromaDB。Agent 在回答问题时会通过语义检索 (Vector Search) 查找相关内容。
                </p>
             </div>
          </div>

          {/* File List */}
          <div className="md:col-span-2 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                 <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">已索引文档</h3>
                 <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{files.length}</span>
             </div>
             
             <div className="overflow-y-auto p-4 space-y-3 flex-1">
                {files.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                        <Database className="w-12 h-12" />
                        <p className="text-sm">暂无文档</p>
                    </div>
                ) : (
                    files.map(file => (
                        <div key={file.id} className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                                        <span className="text-[10px] text-gray-300 dark:text-gray-600">•</span>
                                        <span className={`text-xs flex items-center gap-1 ${
                                            file.status === 'ready' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
                                        }`}>
                                            {file.status === 'ready' ? <CheckCircle className="w-3 h-3"/> : <Loader2 className="w-3 h-3 animate-spin"/>}
                                            {file.status === 'ready' ? '已索引' : file.status === 'processing' ? '切片中...' : '上传中...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {file.status === 'ready' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
             </div>
          </div>
      </div>
    </div>
  );
};