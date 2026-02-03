function Toolbar() {
    return (
    <>
        <div className="toolbar">
            <div className="recents">
                <button id="recent-colors"></button>
            </div>
            <div className="colors">
                <button id="white"></button>
                <button id="grey"></button>
                <button id="red"></button>
                <button id="orange"></button>
                <button id="yellow"></button>
                <button id="green"></button>
                <button id="teal"></button>
                <button id="light-blue"></button>
                <button id="blue"></button>
                <button id="purple"></button>
                <button id="pink"></button>
                <button id="peach"></button>
                <button id="brown"></button>
                <button id="black"></button>
                <button id="dark-grey"></button>
                <button id="dark-red"></button>
                <button id="dark-orange"></button>
                <button id="dark-yellow"></button>
                <button id="dark-green"></button>
                <button id="dark-teal"></button>
                <button id="dark-light-blue"></button>
                <button id="dark-blue"></button>
                <button id="dark-purple"></button>
                <button id="dark-pink"></button>
                <button id="tan"></button>
                <button id="dark-brown"></button>
            </div>
            <div className="drawing">
                <div className="thickness">
                    <button id="draw-thickness"></button>
                </div>
                <div className="draw-or-fill">
                    <button id="draw"></button>
                    <button id="fill"></button>
                </div>
                <div className="undo-or-trash">
                    <button id="undo"></button>
                    <button id="trash"></button>
                </div>
            </div>
        </div>
    </>
    );
};

export default Toolbar;