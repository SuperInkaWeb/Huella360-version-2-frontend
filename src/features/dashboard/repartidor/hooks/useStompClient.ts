import { useState, useEffect, useCallback } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth0 } from '@auth0/auth0-react';
import type { DeliveryResponseDTO } from '../types/delivery';

const STOMP_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

interface UseStompClientProps {
    repartidorId?: number;
    onNewOrder?: (pedido: DeliveryResponseDTO) => void;
}

export const useStompClient = ({ repartidorId, onNewOrder }: UseStompClientProps) => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        if (!repartidorId) return;

        let client: Client | null = null;

        const connect = async () => {
            try {
                const token = await getAccessTokenSilently();

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
                    setIsConnected(true);
                    client?.subscribe('/user/queue/pedidos', (message: IMessage) => {
                        if (message.body) {
                            const pedido = JSON.parse(message.body);
                            if (onNewOrder) {
                                onNewOrder(pedido);
                            }
                        }
                    });
                };

                client.onStompError = (frame) => {
                    console.error('STOMP Error:', frame.headers['message']);
                };

                client.onWebSocketClose = () => {
                    setIsConnected(false);
                };

                client.activate();
                setStompClient(client);
            } catch (error) {
                console.error('Error connecting to WebSocket:', error);
            }
        };

        connect();

        return () => {
            if (client) {
                client.deactivate();
            }
            setStompClient(null);
            setIsConnected(false);
        };
    }, [repartidorId, getAccessTokenSilently]);

    // 2. Función optimizada para enviar ubicación (GPS) sin usar Axios
    const sendLocation = useCallback((lat: number, lng: number, deliveryId: number) => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: `/app/tracking/${deliveryId}/ubicacion`,
                body: JSON.stringify({
                    repartidorId,
                    lat,
                    lng,
                    timestamp: new Date().toISOString()
                }),
            });
        }
    }, [stompClient, repartidorId]);

    return { isConnected, sendLocation, stompClient };
};
