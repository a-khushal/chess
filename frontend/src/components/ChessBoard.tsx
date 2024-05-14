import { Color, PieceSymbol, Square } from "chess.js"
import { useState } from "react";
import { MOVE } from "../pages/Game";

export const ChessBoard = ({ board, socket }: { 
    board: ({
        square: Square; 
        type: PieceSymbol; 
        color: Color 
    } | null)[][];
    socket: WebSocket;
}) => {
    const [from, setFrom] = useState<null | Square>(null);
    const [to, setTo] = useState<null | Square>(null);

    return <div className="text-white">
        { board.map((row, i) => {
            return <div key={i} className="flex">
                {row.map((square, j) => {
                    return <div onClick={()=>{
                        if(!from){
                            setFrom(square?.square ? square.square : null);
                        } else {
                            setTo(square?.square ? square.square : null);
                            socket.send(JSON.stringify({
                                type: MOVE,
                                payload: {
                                    from,
                                    to
                                }
                            }))
                        }
                    }} key={j} className={`w-14 h-14 md:w-16 md:h-14 ${(i+j)%2 ? 'bg-green-900' : 'bg-green-200'}`}>
                            <div className="w-full flex justify-center items-center h-full">
                                <div className=" flex justify-center flex-col">
                                    {square ? square.type : ""}
                                </div>
                            </div>
                    </div>
                })}
            </div>
        })}
    </div>
}