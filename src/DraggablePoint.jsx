import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


const ItemTypes = {
    POINT: 'point',
};

export const DraggablePoint = ({ point, index, movePoint, children }) => {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.POINT,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemTypes.POINT,
        hover: (item, monitor) => {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            movePoint(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
            }}
        >
            {children}
        </div>
    );
};