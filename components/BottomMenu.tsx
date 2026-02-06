import React from 'react';
import { ViewType } from '../types';

interface BottomMenuProps {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    onLogout: () => void;
}

const BottomMenu: React.FC<BottomMenuProps> = ({ currentView, setView, onLogout }) => {
    const menuItems = [
        {
            id: 'INBOX',
            label: 'Virais',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
        },

        {
            id: 'REPOSITORY',
            label: 'Repo',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
        },
        {
            id: 'AI_EDITOR',
            label: 'AI',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
        },
        {
            id: 'TRENDS',
            label: 'Trends',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#030712]/95 backdrop-blur-lg border-t border-white/10 z-50 md:hidden pb-safe">
            <nav className="flex justify-around items-center h-16 px-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id as ViewType)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === item.id
                            ? 'text-orange-500'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {item.icon}
                        <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                    </button>
                ))}
                <button
                    onClick={() => {
                        if (window.confirm('Sair?')) onLogout();
                    }}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-red-500/70 hover:text-red-500"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span className="text-[10px] font-medium tracking-wide">Sair</span>
                </button>
            </nav>
        </div>
    );
};

export default BottomMenu;
