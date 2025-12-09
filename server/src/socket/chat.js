import { GoogleGenerativeAI } from '@google/generative-ai';

const supportedLanguages = ['en', 'hi', 'mr'];

const translateMessage = async (text, sourceLang) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY missing');
        return {
            en: text,
            hi: text,
            mr: text
        };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    Act as a professional translator.
    Translate the following text: "${text}" (Source: ${sourceLang})
    
    Into the following languages:
    1. English (code: en)
    2. Hindi (code: hi)
    3. Marathi (code: mr)

    Output ONLY a valid JSON object where keys are language codes and values are the translations.
    Example: {"en": "Hello", "hi": "नमस्ते", "mr": "नमस्कार"}
    Do not include markdown formatting like \`\`\`json.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonString = response.text().replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonString);
        return parsed;
    } catch (error) {
        console.error('Translation error:', error);
        return {
            en: text,
            hi: text,
            mr: text
        };
    }
};

const generateAIResponse = async (text) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { en: "AI Error", hi: "AI Error", mr: "AI Error" };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are an intelligent AI assistant in a chat room.
    User says: "${text}"
    
    Respond helpfully and concisely.
    Provide your response in JSON format with translations:
    {
        "en": "English response",
        "hi": "Hindi response",
        "mr": "Marathi response"
    }
    Do not include markdown formatting.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonString = response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('AI Generation error:', error);
        return { en: "Sorry, I couldn't process that.", hi: "क्षमा करें, मैं इसे संसाधित नहीं कर सका।", mr: "क्षमस्व, मी त्यावर प्रक्रिया करू शकलो नाही." };
    }
};

export const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User Connected: ${socket.id}`);

        socket.on('join_room', (data) => {
            socket.join(data);
            console.log(`User with ID: ${socket.id} joined room: ${data}`);
        });

        socket.on('send_message', async (data) => {
            console.log('Received message:', data);

            try {
                // 1. Translate message
                const translations = await translateMessage(data.message, data.lang || 'en');

                // 2. Find or create conversation
                // We need senderId and receiverId. 
                // data.room is currently "userId1_userId2"
                const participants = data.room.split('_');
                // We need to know which one is the sender. 
                // Ideally data should have senderId. 
                // For now, let's assume we can look up user by email (data.author)
                // But better to pass senderId from frontend.

                // Let's rely on the frontend sending senderId and receiverId in data if possible, 
                // or infer from room if we trust the room name.
                // Room format: "minId_maxId"

                // To be safe and robust, let's look up the sender by email
                const User = (await import('../models/User.js')).default;
                const Conversation = (await import('../models/Conversation.js')).default;
                const Message = (await import('../models/Message.js')).default;

                const sender = await User.findOne({ email: data.author });
                if (!sender) {
                    console.error('Sender not found:', data.author);
                    return;
                }

                // Identify receiver from room
                const receiverId = participants.find(id => id !== sender._id.toString());

                if (receiverId) {
                    let conversation = await Conversation.findOne({
                        participants: { $all: [sender._id, receiverId] }
                    });

                    if (!conversation) {
                        conversation = new Conversation({
                            participants: [sender._id, receiverId]
                        });
                        await conversation.save();
                    }

                    // 3. Create Message
                    const newMessage = new Message({
                        conversationId: conversation._id,
                        sender: sender._id,
                        text: data.message,
                        type: data.type || 'text',
                        fileUrl: data.fileUrl,
                        fileName: data.fileName,
                        fileSize: data.fileSize,
                        mimeType: data.mimeType,
                        translations: translations
                    });

                    await newMessage.save();

                    // Update last message
                    conversation.lastMessage = newMessage._id;
                    await conversation.save();
                }

                const messageData = { ...data, translations };
                io.in(data.room).emit('receive_message', messageData);

            } catch (err) {
                console.error('Error saving message:', err);
            }
        });

        socket.on('chat_with_ai', async (data) => {
            const userTranslations = await translateMessage(data.message, data.lang || 'en');
            const userMessageData = { ...data, translations: userTranslations };
            io.in(data.room).emit('receive_message', userMessageData);

            const aiTranslations = await generateAIResponse(data.message);
            const aiMessageData = {
                id: Date.now().toString(),
                room: data.room,
                author: 'LinguistAI',
                message: aiTranslations.en,
                translations: aiTranslations,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                lang: 'en'
            };
            io.in(data.room).emit('receive_message', aiMessageData);
        });

        // WebRTC Signaling
        socket.on('call_user', (data) => {
            io.to(data.userToCall).emit('call_user', { signal: data.signalData, from: data.from, name: data.name });
        });

        socket.on('answer_call', (data) => {
            io.to(data.to).emit('call_accepted', data.signal);
        });

        socket.on('ice_candidate', (data) => {
            io.to(data.to).emit('ice_candidate', data.candidate);
        });

        socket.on('end_call', (data) => {
            io.to(data.to).emit('end_call');
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected', socket.id);
        });
    });
};
