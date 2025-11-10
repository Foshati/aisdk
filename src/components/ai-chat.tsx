/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
    PromptInput,
    PromptInputButton,
    PromptInputModelSelect,
    PromptInputModelSelectContent,
    PromptInputModelSelectItem,
    PromptInputModelSelectTrigger,
    PromptInputModelSelectValue,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { useState, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import { GlobeIcon, ImageIcon, X } from 'lucide-react';
import {
    Source,
    Sources,
    SourcesContent,
    SourcesTrigger,
} from '@/components/ai-elements/source';
import {
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';

const models = [
    {
        name: 'Deepseek Chat',
        value: 'deepseek-chat',
        supportsVision: true,
    },
    {
        name: 'Deepseek Coder',
        value: 'deepseek-coder',
        supportsVision: false,
    },
];

const AiChat = () => {
    const [input, setInput] = useState('');
    const [model, setModel] = useState<string>(models[0].value);
    const [webSearch, setWebSearch] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { messages, sendMessage, status } = useChat();

    const currentModel = models.find(m => m.value === model);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() || images.length > 0) {
            const content: Array<{ type: string; text?: string; image?: string }> = [];

            if (input.trim()) {
                content.push({ type: 'text', text: input });
            }

            images.forEach((image) => {
                content.push({
                    type: 'image',
                    image: image,
                });
            });

            sendMessage({
                role: 'user' as const,
                content: input.trim() || 'Image uploaded'
            } as any);

            setInput('');
            setImages([]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
            <div className="flex flex-col h-full">
                <Conversation className="h-full">
                    <ConversationContent>
                        {messages.map((message) => {
                            const sources = message.parts?.filter((part) => part.type === 'source-url') || [];
                            return (
                                <div key={message.id}>
                                    {message.role === 'assistant' && sources.length > 0 && (
                                        <Sources>
                                            <SourcesTrigger count={sources.length} />
                                            <SourcesContent>
                                                {sources.map((part, i) => (
                                                    <Source
                                                        key={`${message.id}-source-${i}`}
                                                        href={part.url}
                                                        title={part.title || part.url}
                                                    />
                                                ))}
                                            </SourcesContent>
                                        </Sources>
                                    )}
                                    <Message from={message.role} key={message.id}>
                                        <MessageContent>
                                            {'content' in message && (message as any).content && (
                                                <Response>
                                                    {String((message as any).content)}
                                                </Response>
                                            )}
                                            {message.parts?.map((part, i) => {
                                                switch (part.type) {
                                                    case 'text':
                                                        return (
                                                            <Response key={`${message.id}-${i}`}>
                                                                {part.text}
                                                            </Response>
                                                        );
                                                    case 'reasoning':
                                                        return (
                                                            <Reasoning
                                                                key={`${message.id}-${i}`}
                                                                className="w-full"
                                                                isStreaming={status === 'streaming'}
                                                            >
                                                                <ReasoningTrigger />
                                                                <ReasoningContent>{part.text}</ReasoningContent>
                                                            </Reasoning>
                                                        );
                                                    default:
                                                        return null;
                                                }
                                            })}
                                        </MessageContent>
                                    </Message>
                                </div>
                            );
                        })}
                        {status === 'submitted' && <Loader />}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>

                <PromptInput onSubmit={handleSubmit} className="mt-4">
                    {/* نمایش تصاویر آپلود شده */}
                    {images.length > 0 && (
                        <div className="flex gap-2 p-2 flex-wrap">
                            {images.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={img}
                                        alt={`Preview ${index}`}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <PromptInputTextarea
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        placeholder={currentModel?.supportsVision ? "Write your message or upload an image..." : "Write your message..."}
                    />

                    <PromptInputToolbar>
                        <PromptInputTools>
                            {/* دکمه آپلود تصویر */}
                            {currentModel?.supportsVision && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <PromptInputButton
                                        type="button"
                                        variant="ghost"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <ImageIcon size={16} />
                                        <span>Image</span>
                                    </PromptInputButton>
                                </>
                            )}

                            <PromptInputButton
                                variant={webSearch ? 'default' : 'ghost'}
                                onClick={() => setWebSearch(!webSearch)}
                            >
                                <GlobeIcon size={16} />
                                <span>Search</span>
                            </PromptInputButton>

                            <PromptInputModelSelect
                                onValueChange={(value) => {
                                    setModel(value);
                                    // پاک کردن تصاویر اگر مدل انتخابی از Vision پشتیبانی نمی‌کند
                                    const selectedModel = models.find(m => m.value === value);
                                    if (!selectedModel?.supportsVision) {
                                        setImages([]);
                                    }
                                }}
                                value={model}
                            >
                                <PromptInputModelSelectTrigger>
                                    <PromptInputModelSelectValue />
                                </PromptInputModelSelectTrigger>
                                <PromptInputModelSelectContent>
                                    {models.map((model) => (
                                        <PromptInputModelSelectItem key={model.value} value={model.value}>
                                            {model.name}
                                            {model.supportsVision && ' 👁️'}
                                        </PromptInputModelSelectItem>
                                    ))}
                                </PromptInputModelSelectContent>
                            </PromptInputModelSelect>
                        </PromptInputTools>
                        <PromptInputSubmit disabled={!input && images.length === 0} status={status} />
                    </PromptInputToolbar>
                </PromptInput>
            </div>
        </div>
    );
};

export default AiChat;