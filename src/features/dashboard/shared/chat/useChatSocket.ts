import { useEffect, useRef } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth0 } from "@auth0/auth0-react";
import type { ChatMensaje } from "./types/chat.types";

const STOMP_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080";

export const useChatSocket = (roomId: number | null, onMessage: (mensaje: ChatMensaje) => void) => {
    const { getAccessTokenSilently } = useAuth0();
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    useEffect(() => {
        if (!roomId) return;

        let client: Client | null = null;
        let cancelled = false;

        const connect = async () => {
            try {
                const token = await getAccessTokenSilently();
                if (cancelled) return;

                client = new Client({
                    webSocketFactory: () => new SockJS(`${STOMP_URL}/api/v1/ws`),
                    connectHeaders: {
                        Authorization: `Bearer ${token}`,
                    },
                    reconnectDelay: 5000,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                });

                client.onConnect = () => {
                    client?.subscribe(`/topic/chat-empresa/${roomId}/mensajes`, (message: IMessage) => {
                        if (message.body) {
                            const mensaje: ChatMensaje = JSON.parse(message.body);
                            onMessageRef.current(mensaje);
                        }
                    });
                };

                client.onStompError = (frame) => {
                    console.error("STOMP Error (chat):", frame.headers["message"]);
                };

                client.activate();
            } catch (error) {
                console.error("Error connecting to chat WebSocket:", error);
            }
        };

        connect();

        return () => {
            cancelled = true;
            client?.deactivate();
        };
    }, [roomId, getAccessTokenSilently]);
};
