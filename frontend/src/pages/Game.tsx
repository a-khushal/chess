import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js"

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = 'game_over';

export const Game = () => {
    const socket = useSocket();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());

    useEffect(()=>{
        if(!socket){
            return;
        }
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch(message.type){
                case INIT_GAME: 
                    setBoard(chess.board());
                    console.log("game initialized");
                    break;
                case MOVE:{
                    const move = message.payload;
                    chess.move(move);
                    setBoard(chess.board());
                    console.log("move made");
                    break;
                }
                case GAME_OVER:
                    console.log("Game over");
                    break;
            }
        }
    }, [socket, chess])

    if(!socket)
        return <div>Connecting...</div>

    return <div className="flex justify-center">
        <div className="pt-8 max-w-screen-lg w-full h-screen overflow-none px-5">
            <div className="flex justify-center items-center h-full">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="col-span-4 w-full flex justify-center h-full items-center">
                        <ChessBoard chess={chess} setBoard={setBoard} board={ board } socket={ socket }/>
                    </div>
                    <div className="flex justify-center items-center">
                        <div className="text-white col-span-2 bg-green-600 w-14 h-16 rounded-lg">
                            <Button onClick={()=>{
                                socket.send(JSON.stringify({
                                    type: INIT_GAME
                                }))
                            }}>
                                Play
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}