
export const Button = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => {
    return <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-10 rounded-lg text-3xl" onClick={onClick}>
        { children }
    </button>
}