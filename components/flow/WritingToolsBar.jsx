export default function WritingToolsBar() {
    return(
        <>
            <div
                className={`bg-white rounded-lg border shadow-sm p-1.5 inline-flex items-center gap-1 `}
            >
                <div className="flex items-center gap-1">
                    <Button variant="outline">粗細</Button>
                    <Button variant="outline">顏色</Button>
                    <Button variant="outline">橡皮擦</Button>
                    <Button variant="outline">清除</Button>
                </div>
            </div>
        </>
    );
}