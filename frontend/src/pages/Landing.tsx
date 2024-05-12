
import { useNavigate } from "react-router-dom"

export const Landing = () => {
    const navigate = useNavigate();
    return <div className="flex justify-center h-screen items-center p-3">
        <div className="pt-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex justify-center items-center">
                    <img src={"../../public/cover.jpg"} alt="landing image" className="w-110"/>
                </div>
                <div className="flex justify-center items-center">
                    <div className="pt-16">
                        <div className="flex justify-center">
                            <h1 className="text-4xl font-bold text-white">Play Chess Online on the #2 Site!</h1>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-10 rounded-lg text-3xl" onClick={()=>navigate("/game")}>
                                Play Online
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}