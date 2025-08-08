import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { KindWallPost, KindWallPostStatus } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { useLanguage } from './LanguageContext.tsx';

interface KindWallContextType {
  posts: KindWallPost[];
  loading: boolean;
  addPost: (postData: Omit<KindWallPost, 'id' | 'status' | 'userId' | 'userName' | 'createdAt' | 'language'>) => void;
  updatePostStatus: (postId: number, status: KindWallPostStatus) => void;
  deletePost: (postId: number) => void;
}

const KindWallContext = createContext<KindWallContextType | undefined>(undefined);

const STORAGE_KEY = 'reuseday_kindwall_posts';

const getInitialPosts = (): KindWallPost[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse KindWall posts from localStorage", e);
    }
    return [];
};

export const KindWallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<KindWallPost[]>(getInitialPosts);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { language } = useLanguage();

    const savePosts = (updatedPosts: KindWallPost[]) => {
        setPosts(updatedPosts);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
    };

    const addPost = useCallback((postData: Omit<KindWallPost, 'id' | 'status' | 'userId' | 'userName' | 'createdAt' | 'language'>) => {
        const newPost: KindWallPost = {
            ...postData,
            id: Date.now(),
            status: 'pending',
            userId: user?.id || 0, // 0 for anonymous
            userName: user?.name || 'Anonymous', // 'Anonymous' for guests
            createdAt: new Date().toISOString(),
            language: language,
        };
        savePosts([newPost, ...posts]);
    }, [posts, user, language]);
    
    const updatePostStatus = useCallback((postId: number, status: KindWallPostStatus) => {
        const updatedPosts = posts.map(p => p.id === postId ? { ...p, status } : p);
        savePosts(updatedPosts);
    }, [posts]);

    const deletePost = useCallback((postId: number) => {
        savePosts(posts.filter(p => p.id !== postId));
    }, [posts]);

    const value = { posts, loading, addPost, updatePostStatus, deletePost };

    return (
        <KindWallContext.Provider value={value}>
            {children}
        </KindWallContext.Provider>
    );
};

export const useKindWall = () => {
    const context = useContext(KindWallContext);
    if (context === undefined) {
        throw new Error('useKindWall must be used within a KindWallProvider');
    }
    return context;
};