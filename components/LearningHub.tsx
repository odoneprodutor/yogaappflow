

import React, { useState, useEffect } from 'react';
import { Article, Comment } from '../types';
import { knowledgeBase } from '../services/knowledgeBase';
import { Badge, Button, Card } from './ui';
import { ArrowLeft, Clock, BookOpen, Share2, Sparkles, User, Tag, Settings, Plus, X, Image as ImageIcon, Heart, MessageCircle, Send, ThumbsUp, CornerDownRight, Users, Newspaper, Trash2 } from 'lucide-react';
import { authService } from '../services/auth';

export const LearningHub: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [filter, setFilter] = useState<string>('Todos');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // View Mode State (Similar to PoseLibrary)
    const [viewMode, setViewMode] = useState<'OFFICIAL' | 'COMMUNITY'>('OFFICIAL');

    // Current User State
    const [currentUser, setCurrentUser] = useState<any>(null); // Using any temporarily to bypass generic User type issues if imported wrong, but better to use User type

    useEffect(() => {
        const loadUser = async () => {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
        };
        loadUser();
    }, []);

    // New Article Form
    const [newArticleData, setNewArticleData] = useState<Partial<Article>>({
        category: 'Inspiração',
        readTime: '3 min',
        author: currentUser?.name || 'Membro da Comunidade',
        content: []
    });
    const [contentInput, setContentInput] = useState('');

    // Fix: Update author name when currentUser loads
    useEffect(() => {
        if (currentUser?.name) {
            setNewArticleData(prev => ({ ...prev, author: currentUser.name }));
        }
    }, [currentUser]);

    // Comment Form
    const [commentInput, setCommentInput] = useState('');

    // Reply State
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState('');

    // Feed Interaction States
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
    const [feedCommentInput, setFeedCommentInput] = useState('');

    const [dailyArticle, setDailyArticle] = useState<Article | null>(null);

    // Load articles on mount
    useEffect(() => {
        refreshArticles();
    }, []);

    const refreshArticles = async () => {
        const all = await knowledgeBase.getAllArticles();
        setArticles(all);
        const daily = await knowledgeBase.getDailyArticle();
        setDailyArticle(daily);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewArticleData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Updated Filters - Removed 'Plataforma' and 'Comunidade' as they are now tabs
    const filterOptions = ['Todos', 'Filosofia', 'Benefícios', 'Inspiração', 'Anatomia'];
    const articleCategories = ['Filosofia', 'Benefícios', 'Inspiração', 'Anatomia'];

    // Enhanced Filtering Logic based on ViewMode
    // Enhanced Filtering Logic & Social Algo
    let filteredArticles = articles.filter(a => {
        // 1. Filter by View Mode (Tab)
        if (viewMode === 'OFFICIAL' && a.isUserGenerated) return false;
        if (viewMode === 'COMMUNITY' && !a.isUserGenerated) return false;

        // 2. Filter by Category
        if (filter === 'Todos') return true;
        return a.category === filter;
    });

    // Social Algorithm: Rank by Engagement (Likes + Comments)
    if (viewMode === 'COMMUNITY') {
        filteredArticles = filteredArticles.sort((a, b) => {
            const scoreA = (a.likes || 0) + ((a.comments?.length || 0) * 2);
            const scoreB = (b.likes || 0) + ((b.comments?.length || 0) * 2);
            // Default to newest if scores match
            if (scoreB !== scoreA) return scoreB - scoreA;
            return Number(b.id) - Number(a.id);
        });
    }

    const handleAddArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newArticleData.title || !contentInput) {
            alert("Por favor preencha o Título e o Conteúdo.");
            return;
        }

        const paragraphs = contentInput.split('\n').filter(p => p.trim().length > 0);

        // Auto-generate excerpt from first paragraph
        const generatedExcerpt = paragraphs[0]
            ? paragraphs[0].slice(0, 120) + (paragraphs[0].length > 120 ? '...' : '')
            : 'Nova publicação da comunidade';

        const articleToAdd: Article = {
            id: Date.now().toString(),
            userId: currentUser?.id,
            title: newArticleData.title,
            excerpt: generatedExcerpt,
            imageUrl: newArticleData.imageUrl || 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=600',
            category: newArticleData.category as any,
            author: newArticleData.author || currentUser?.name || 'Comunidade',
            readTime: '2 min',
            content: paragraphs,
            likes: 0,
            likedBy: [],
            comments: [],
            isUserGenerated: true
        };

        await knowledgeBase.addArticle(articleToAdd);
        await refreshArticles();
        setIsAddModalOpen(false);
        // Switch to community view to see the new post
        setViewMode('COMMUNITY');
        setNewArticleData({ category: 'Inspiração', readTime: '3 min', author: currentUser?.name || 'Comunidade', content: [] });
        setContentInput('');
    };

    const handleDeleteArticle = async (e: React.MouseEvent, articleId: string) => {
        e.stopPropagation();
        if (window.confirm("Tem certeza que deseja apagar esta publicação?")) {
            try {
                await knowledgeBase.deleteArticle(articleId);
                await refreshArticles();
                if (selectedArticle?.id === articleId) {
                    setSelectedArticle(null);
                }
            } catch (error: any) {
                alert(error.message || "Não foi possível excluir o artigo.");
            }
        }
    };

    const handleLikeArticle = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedArticle && currentUser) {
            const updated = await knowledgeBase.toggleLike(selectedArticle.id, currentUser.id);
            if (updated) {
                setSelectedArticle(updated);
                refreshArticles(); // Don't await to feel faster
            }
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim() || !selectedArticle) return;

        const updated = await knowledgeBase.addComment(selectedArticle.id, commentInput);
        if (updated) {
            setSelectedArticle(updated);
            await refreshArticles();
            setCommentInput('');
        }
    };

    const handleLikeComment = async (commentId: string) => {
        if (selectedArticle && currentUser) {
            const updated = await knowledgeBase.toggleCommentLike(selectedArticle.id, commentId, currentUser.id);
            if (updated) {
                setSelectedArticle(updated);
                refreshArticles();
            }
        }
    };

    const handleReplyToComment = async (parentCommentId: string) => {
        if (!replyInput.trim() || !selectedArticle) return;

        const updated = await knowledgeBase.addReply(selectedArticle.id, parentCommentId, replyInput);
        if (updated) {
            setSelectedArticle(updated);
            await refreshArticles();
            setReplyInput('');
            setReplyingTo(null);
        }
    };

    const handleLikeFromFeed = async (e: React.MouseEvent, articleId: string) => {
        e.stopPropagation();
        if (!currentUser) return;
        // Optimistic UI update could be done here
        const updated = await knowledgeBase.toggleLike(articleId, currentUser.id);
        if (updated) {
            refreshArticles();
        }
    };

    const handlePostCommentFromFeed = async (e: React.FormEvent, articleId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!feedCommentInput.trim()) return;

        const updated = await knowledgeBase.addComment(articleId, feedCommentInput);
        if (updated) {
            await refreshArticles();
            setFeedCommentInput('');
            setActiveCommentId(null);
        }
    };

    // Helper to render comments recursively
    const renderComment = (comment: Comment, isReply = false) => {
        const isLikedByMe = currentUser ? (comment.likedBy || []).includes(currentUser.id) : false;
        const isReplying = replyingTo === comment.id;

        return (
            <div key={comment.id} className={`group bg-white p-6 rounded-2xl border border-stone-100 hover:border-sage-200 transition-colors shadow-sm ${isReply ? 'ml-8 md:ml-12 border-l-4 border-l-sage-100' : ''}`}>
                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-sm ${isReply ? 'bg-stone-50 text-stone-500' : 'bg-stone-100 text-stone-600'}`}>
                        {comment.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                <span className="font-bold text-sage-900">{comment.userName}</span>
                                <span className="text-xs text-stone-400 hidden sm:inline">•</span>
                                <span className="text-xs text-stone-400">
                                    {new Date(comment.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                </span>
                            </div>
                        </div>
                        <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                            {comment.text}
                        </p>

                        {/* Interaction Actions */}
                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={() => handleLikeComment(comment.id)}
                                className={`text-xs font-medium flex items-center gap-1 transition-colors ${isLikedByMe ? 'text-red-500' : 'text-stone-400 hover:text-sage-600'}`}
                            >
                                <ThumbsUp size={12} fill={isLikedByMe ? "currentColor" : "none"} />
                                {comment.likes > 0 ? comment.likes : 'Curtir'}
                            </button>

                            <button
                                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                                className="text-xs font-medium text-stone-400 hover:text-sage-600 flex items-center gap-1 transition-colors"
                            >
                                <MessageCircle size={12} /> Responder
                            </button>
                        </div>

                        {/* Reply Input */}
                        {isReplying && (
                            <div className="mt-4 animate-fade-in pl-4 border-l-2 border-sage-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={replyInput}
                                        onChange={(e) => setReplyInput(e.target.value)}
                                        placeholder={`Respondendo a ${comment.userName}...`}
                                        className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-sage-300"
                                    />
                                    <Button size="sm" onClick={() => handleReplyToComment(comment.id)} disabled={!replyInput.trim()} className="h-full py-2 px-3">
                                        <Send size={14} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Render Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pt-2">
                        {comment.replies.map(reply => renderComment(reply, true))}
                    </div>
                )}
            </div>
        );
    };

    if (selectedArticle) {
        const isLikedByMe = currentUser ? (selectedArticle.likedBy || []).includes(currentUser.id) : false;

        return (
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-fade-in">
                {/* Navigation Bar */}
                <nav className="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-stone-100 px-4 h-16 flex items-center justify-between max-w-5xl mx-auto w-full">
                    <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="text-stone-600 hover:bg-stone-100 -ml-2 gap-2 pl-2 pr-4">
                        <ArrowLeft size={20} /> <span className="font-medium">Voltar</span>
                    </Button>
                    <div className="flex gap-2">
                        {currentUser && selectedArticle.userId === currentUser.id && (
                            <button
                                onClick={(e) => handleDeleteArticle(e, selectedArticle.id)}
                                className="p-2 text-stone-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                title="Apagar"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button className="p-2 text-stone-400 hover:text-sage-600 rounded-full hover:bg-stone-50 transition-colors" title="Compartilhar">
                            <Share2 size={20} />
                        </button>
                    </div>
                </nav>

                {selectedArticle.isUserGenerated || viewMode === 'COMMUNITY' ? (
                    /* Layout de Post da Comunidade (Focado na Discussão) */
                    <div className="max-w-2xl mx-auto px-4 py-8">
                        <div className="bg-white mb-8 border border-stone-100 rounded-2xl p-6 shadow-sm">
                            {/* Author Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 font-bold text-lg">
                                    {selectedArticle.author.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-stone-900 leading-tight">{selectedArticle.title}</h1>
                                    <p className="text-xs text-stone-500 mt-1">Por {selectedArticle.author} • {selectedArticle.category}</p>
                                </div>
                            </div>

                            {/* Content Text */}
                            <div className="prose prose-stone mb-6 text-stone-800 text-base leading-relaxed">
                                {Array.isArray(selectedArticle.content) ? (
                                    selectedArticle.content.map((p, i) => <p key={i}>{p}</p>)
                                ) : (
                                    <p className="whitespace-pre-wrap">{String(selectedArticle.content)}</p>
                                )}
                            </div>

                            {/* Image */}
                            {selectedArticle.imageUrl && (
                                <div className="rounded-xl overflow-hidden mb-6 border border-stone-100 bg-stone-50">
                                    <img src={selectedArticle.imageUrl} className="w-full object-cover max-h-[500px]" alt="" />
                                </div>
                            )}

                            {/* Action Bar Simplified */}
                            <div className="flex items-center gap-6 py-4 border-t border-b border-stone-100 mb-8 max-w-md">
                                <button
                                    onClick={handleLikeArticle}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLikedByMe ? 'text-red-500' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    <Heart size={20} fill={isLikedByMe ? "currentColor" : "none"} className={isLikedByMe ? "animate-pulse" : ""} />
                                    <span>{selectedArticle.likes} Curtidas</span>
                                </button>
                                <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
                                    <MessageCircle size={20} />
                                    <span>{selectedArticle.comments?.length || 0} Comentários</span>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div>
                                <h3 className="text-lg font-bold text-stone-900 mb-6">Comentários</h3>

                                {/* Input */}
                                <div className="flex gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-full bg-sage-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                        {currentUser?.name.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <form onSubmit={handlePostComment} className="relative">
                                            <textarea
                                                value={commentInput}
                                                onChange={(e) => setCommentInput(e.target.value)}
                                                placeholder="Escreva um comentário..."
                                                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300 min-h-[80px] resize-y text-sm pr-12"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!commentInput.trim()}
                                                className="absolute bottom-3 right-3 p-2 bg-sage-600 text-white rounded-lg disabled:opacity-50 hover:bg-sage-700 transition-colors shadow-sm"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* List */}
                                <div className="space-y-6">
                                    {selectedArticle.comments && selectedArticle.comments.length > 0 ? (
                                        [...selectedArticle.comments].reverse().map(comment => renderComment(comment))
                                    ) : (
                                        <div className="text-center py-10 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                                            <p className="text-stone-500 text-sm">Nenhum comentário ainda. Comece a conversa!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Layout Oficial (Mantido Original) */
                    <div>
                        <article className="max-w-3xl mx-auto px-4 py-8">
                            {/* Header */}
                            <header className="mb-8 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                                    <Badge color={
                                        selectedArticle.category === 'Filosofia' ? 'blue' :
                                            selectedArticle.category === 'Inspiração' ? 'orange' : 'green'
                                    }>
                                        {selectedArticle.category}
                                    </Badge>
                                    {selectedArticle.isUserGenerated && (
                                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1">
                                            <Users size={10} /> Comunidade
                                        </span>
                                    )}
                                    <span className="text-xs text-stone-400 flex items-center gap-1 ml-2">
                                        <Clock size={12} /> {selectedArticle.readTime} de leitura
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-5xl font-serif text-sage-900 mb-6 leading-tight tracking-tight">
                                    {selectedArticle.title}
                                </h1>

                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold text-lg">
                                        {selectedArticle.author.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-stone-800">{selectedArticle.author}</p>
                                        <p className="text-xs text-stone-500">Autor(a)</p>
                                    </div>
                                </div>
                            </header>

                            {/* Featured Image */}
                            <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-10 shadow-lg bg-stone-100">
                                <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Content */}
                            <div className="prose prose-stone prose-lg md:prose-xl max-w-none mb-16 px-1">
                                <p className="lead text-xl text-stone-600 italic font-serif border-l-4 border-sage-300 pl-4 mb-8">
                                    {selectedArticle.excerpt}
                                </p>
                                {Array.isArray(selectedArticle.content) ? (
                                    selectedArticle.content.map((paragraph, idx) => (
                                        <p key={idx} className="mb-6 text-stone-800 leading-relaxed font-light">
                                            {paragraph}
                                        </p>
                                    ))
                                ) : (
                                    <p className="mb-6 text-stone-800 leading-relaxed font-light whitespace-pre-wrap">
                                        {String(selectedArticle.content)}
                                    </p>
                                )}
                            </div>
                        </article>

                        {/* Social / Interactions Section */}
                        <section className="bg-stone-50 border-t border-stone-200 py-12 px-4">
                            <div className="max-w-3xl mx-auto">

                                {/* Actions Bar */}
                                <div className="flex items-center justify-between mb-10 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={(e) => handleLikeArticle(e)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium border ${isLikedByMe
                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                                                }`}
                                        >
                                            <Heart size={20} fill={isLikedByMe ? "currentColor" : "none"} className={isLikedByMe ? "animate-pulse" : ""} />
                                            <span>{selectedArticle.likes}</span>
                                            <span className="hidden sm:inline">Curtidas</span>
                                        </button>
                                    </div>
                                    <div className="text-stone-400 text-sm font-medium">
                                        {selectedArticle.comments?.length || 0} Comentários
                                    </div>
                                </div>

                                <h3 className="text-2xl font-serif text-sage-900 mb-6">Discussão</h3>

                                {/* Comment Input Area */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-10">
                                    <div className="flex gap-4">
                                        <div className="hidden sm:flex w-10 h-10 rounded-full bg-sage-100 items-center justify-center text-sage-700 font-bold shrink-0">
                                            {currentUser?.name.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <form onSubmit={handlePostComment}>
                                                <textarea
                                                    value={commentInput}
                                                    onChange={(e) => setCommentInput(e.target.value)}
                                                    placeholder="Adicione um comentário construtivo..."
                                                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300 focus:bg-white transition-all min-h-[100px] resize-y text-stone-700 placeholder-stone-400"
                                                />
                                                <div className="flex justify-between items-center mt-3">
                                                    <p className="text-xs text-stone-400">Seja gentil e respeitoso.</p>
                                                    <Button
                                                        type="submit"
                                                        disabled={!commentInput.trim()}
                                                        className="bg-sage-600 hover:bg-sage-700 text-white px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Publicar
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {selectedArticle.comments && selectedArticle.comments.length > 0 ? (
                                        [...selectedArticle.comments].reverse().map(comment => renderComment(comment))
                                    ) : (
                                        <div className="text-center py-12 px-4 bg-white/50 rounded-3xl border border-dashed border-stone-200">
                                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                                                <MessageCircle size={24} />
                                            </div>
                                            <h4 className="text-stone-900 font-medium mb-1">Ainda não há comentários</h4>
                                            <p className="text-stone-500 text-sm">Seja a primeira pessoa a compartilhar seus pensamentos sobre este tema.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="pb-24 pt-8 px-4 max-w-5xl mx-auto animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-light text-sage-900">Aprendizado Diário</h1>
                <p className="text-stone-500">Nutra sua mente com sabedoria e troque experiências.</p>
            </div>

            {/* Main Tabs (Official vs Community) */}
            {/* Main Tabs (Official vs Community) Responsive Layout */}
            <div className="flex flex-wrap items-center justify-between border-b border-stone-200 mb-8 gap-4">
                <div className="flex gap-4 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => { setViewMode('OFFICIAL'); setFilter('Todos'); }}
                        className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${viewMode === 'OFFICIAL'
                            ? 'border-sage-600 text-sage-800'
                            : 'border-transparent text-stone-400 hover:text-stone-600'
                            }`}
                    >
                        <Newspaper size={18} /> Artigos & Estudos
                    </button>
                    <button
                        onClick={() => { setViewMode('COMMUNITY'); setFilter('Todos'); }}
                        className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${viewMode === 'COMMUNITY'
                            ? 'border-sage-600 text-sage-800'
                            : 'border-transparent text-stone-400 hover:text-stone-600'
                            }`}
                    >
                        <Users size={18} /> Comunidade
                    </button>
                </div>

                {/* Action Button - Moved out of overflow container, responsive positioning */}
                {viewMode === 'COMMUNITY' && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto mb-2 md:mb-0 flex items-center justify-center gap-2 px-4 py-2 bg-sage-600 text-white text-xs font-medium rounded-full hover:bg-sage-700 transition-colors shadow-sm"
                    >
                        <Plus size={14} /> Publicar na Comunidade
                    </button>
                )}
            </div>

            {/* Featured Daily Article - Only in Official View */}
            {viewMode === 'OFFICIAL' && dailyArticle && (
                <section className="mb-10 animate-fade-in">
                    <h2 className="text-xs font-bold text-sage-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles size={14} /> Destaque de Hoje
                    </h2>
                    <div
                        onClick={() => setSelectedArticle(dailyArticle)}
                        className="group cursor-pointer relative rounded-3xl overflow-hidden bg-stone-900 aspect-[4/3] md:aspect-[21/9] shadow-xl"
                        role="button"
                        aria-label={`Ler artigo destaque: ${dailyArticle.title}`}
                    >
                        {dailyArticle.imageUrl ? (
                            <img
                                src={dailyArticle.imageUrl}
                                alt=""
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-stone-800 opacity-60 flex items-center justify-center">
                                <Sparkles className="text-white/20 w-32 h-32" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
                            <div className="mb-2 flex items-center gap-2">
                                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                                    {dailyArticle.category}
                                </span>
                                <span className="text-white/80 text-xs flex inline-flex items-center gap-1">
                                    <Clock size={12} /> {dailyArticle.readTime}
                                </span>
                                <span className="text-white/80 text-xs flex inline-flex items-center gap-1 ml-2">
                                    <Heart size={12} fill="currentColor" /> {dailyArticle.likes}
                                </span>
                            </div>
                            <h3 className="text-2xl md:text-4xl font-serif text-white mb-2 leading-tight group-hover:translate-x-2 transition-transform">
                                {dailyArticle.title}
                            </h3>
                            <p className="text-stone-200 text-sm md:text-base line-clamp-2 max-w-2xl">
                                {dailyArticle.excerpt}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Categories Filter */}
            {/* Categories Filter - Only Official */}
            {viewMode === 'OFFICIAL' && (
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6" role="tablist">
                    {filterOptions.map(opt => (
                        <button
                            key={opt}
                            role="tab"
                            aria-selected={filter === opt}
                            onClick={() => setFilter(opt)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border ${filter === opt
                                ? 'bg-sage-600 text-white border-sage-600'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-sage-400'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {/* Article Grid */}
            {/* Article Grid / Feed */}
            {viewMode === 'COMMUNITY' ? (
                /* COMMUNITY FEED LAYOUT */
                <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
                    {filteredArticles.map(article => {
                        const isMyPost = currentUser && article.userId === currentUser.id;
                        return (
                            <div
                                key={article.id}
                                className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:border-sage-300 transition-colors"
                                onClick={() => setSelectedArticle(article)}
                            >
                                {/* Header */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center font-bold text-sage-700">
                                            {article.author.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-800 text-sm">{article.author}</p>
                                            <div className="flex items-center gap-1 text-xs text-stone-400">
                                                <span>2h</span> • <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-500">{article.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isMyPost && (
                                        <button onClick={(e) => handleDeleteArticle(e, article.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Text Content */}
                                <div className="px-4 pb-3 cursor-pointer" onClick={() => setSelectedArticle(article)}>
                                    <h3 className="font-medium text-lg text-stone-900 mb-2">{article.title}</h3>
                                    {article.excerpt && <p className="text-stone-700 text-sm mb-2">{article.excerpt}</p>}
                                </div>

                                {/* Image - Only if exists */}
                                {article.imageUrl && (
                                    <div className="cursor-pointer bg-stone-50" onClick={() => setSelectedArticle(article)}>
                                        <img src={article.imageUrl} className="w-full object-cover max-h-[500px]" alt="" loading="lazy" />
                                    </div>
                                )}

                                {/* Actions Bar - Social Style */}
                                <div className="px-4 py-3 flex items-center justify-between border-t border-stone-100">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={(e) => handleLikeFromFeed(e, article.id)}
                                            className={`flex items-center gap-2 transition-colors group ${currentUser && article.likedBy?.includes(currentUser.id) ? 'text-red-500' : 'text-stone-500 hover:text-red-500'}`}
                                        >
                                            <Heart size={22} fill={currentUser && article.likedBy?.includes(currentUser.id) ? "currentColor" : "none"} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium">{article.likes > 0 ? article.likes : 'Curtir'}</span>
                                        </button>
                                        <button
                                            className="flex items-center gap-2 text-stone-500 hover:text-sage-600 transition-colors group"
                                            onClick={(e) => { e.stopPropagation(); setSelectedArticle(article); }}
                                        >
                                            <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium">{article.comments?.length > 0 ? article.comments.length : 'Comentar'}</span>
                                        </button>
                                    </div>
                                    <button className="text-stone-400 hover:text-sage-600 p-2 rounded-full hover:bg-stone-50">
                                        <Share2 size={20} />
                                    </button>
                                </div>

                                {/* Inline Comment Input */}

                            </div>
                        );
                    })}
                </div>
            ) : (
                /* OFFICIAL GRID LAYOUT */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {filteredArticles.map(article => {
                        const isMyPost = currentUser && article.userId === currentUser.id;
                        return (
                            <div
                                key={article.id}
                                onClick={() => setSelectedArticle(article)}
                                className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden cursor-pointer group hover:border-sage-300 transition-colors h-full flex flex-col relative"
                            >
                                <div className="h-48 overflow-hidden bg-stone-100 relative flex items-center justify-center">
                                    {article.imageUrl ? (
                                        <img
                                            src={article.imageUrl}
                                            alt=""
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <Newspaper size={48} className="text-stone-300 opacity-50" />
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-stone-600 uppercase tracking-wider shadow-sm">
                                            {article.category}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-medium text-sage-900 mb-2 leading-snug group-hover:text-sage-700 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">
                                        {article.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-stone-400 mt-auto pt-4 border-t border-stone-50">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Heart size={12} /> {article.likes}</span>
                                            <span className="flex items-center gap-1"><MessageCircle size={12} /> {article.comments?.length || 0}</span>
                                        </div>
                                        {/* Removido autor para limpar */}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {filteredArticles.length === 0 && (
                <div className="text-center py-20 text-stone-400">
                    {viewMode === 'COMMUNITY' ? (
                        <>
                            <Users size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Ainda não há publicações da comunidade nesta categoria.</p>
                            <button onClick={() => setIsAddModalOpen(true)} className="text-sage-600 font-medium mt-2 hover:underline">
                                Seja a primeira pessoa a postar!
                            </button>
                        </>
                    ) : (
                        <>
                            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Nenhum artigo oficial encontrado nesta categoria.</p>
                        </>
                    )}
                </div>
            )}

            {/* ADD ARTICLE MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-3xl">
                            <h3 className="text-xl font-light text-sage-900">Publicar na Comunidade</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="add-article-form" onSubmit={handleAddArticle} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Título do Post</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300 text-lg font-medium"
                                        placeholder="Um título inspirador..."
                                        value={newArticleData.title || ''}
                                        onChange={(e) => setNewArticleData({ ...newArticleData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Categoria</label>
                                        <select
                                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300"
                                            value={newArticleData.category}
                                            onChange={(e) => setNewArticleData({ ...newArticleData, category: e.target.value as any })}
                                        >
                                            {articleCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Autor (Você)</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300 bg-stone-100 text-stone-500 cursor-not-allowed"
                                            value={newArticleData.author || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Foto / Vídeo</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex-1 cursor-pointer group">
                                            <div className={`h-40 w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${newArticleData.imageUrl ? 'border-sage-500 bg-sage-50' : 'border-stone-300 bg-stone-50 hover:border-sage-400'}`}>
                                                {newArticleData.imageUrl ? (
                                                    <img src={newArticleData.imageUrl} alt="Preview" className="h-full w-full object-cover rounded-lg opacity-80" />
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                                            <ImageIcon className="text-sage-500" size={24} />
                                                        </div>
                                                        <span className="text-sm font-medium text-stone-500 group-hover:text-sage-700">Adicionar Foto</span>
                                                        <span className="text-xs text-stone-400 mt-1">Clique para upload</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Resumo (Para o Card)</label>
                                    <textarea
                                        required
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300 h-20"
                                        placeholder="Uma breve introdução que aparecerá na lista..."
                                        value={newArticleData.excerpt || ''}
                                        onChange={(e) => setNewArticleData({ ...newArticleData, excerpt: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Conteúdo</label>
                                    <textarea
                                        required
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300 h-64"
                                        placeholder="Escreva o conteúdo aqui. Pressione Enter duas vezes para criar um novo parágrafo."
                                        value={contentInput}
                                        onChange={(e) => setContentInput(e.target.value)}
                                    />
                                    <p className="text-xs text-stone-400 mt-2">Dica: Cada quebra de linha será tratada como um novo parágrafo.</p>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-stone-100 flex justify-end gap-3 rounded-b-3xl bg-white">
                            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" form="add-article-form">Publicar Post</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
