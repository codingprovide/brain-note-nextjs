import {
  Position,
  MarkerType,
  InternalNode,
  Node as FlowNode,
} from "@xyflow/react";

// 自定义的简化节点结构，用于计算
interface CustomNode {
  measured: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
}

// 这是一个适配函数，将 InternalNode 转换为我们的 CustomNode 类型
function adaptNode(node: InternalNode<FlowNode>): CustomNode {
  if (
    !node.measured?.width ||
    !node.measured?.height ||
    node.position === undefined
  ) {
    throw new Error("Node is missing required properties");
  }

  return {
    measured: {
      width: node.measured.width,
      height: node.measured.height,
    },
    position: {
      x: node.position.x,
      y: node.position.y,
    },
  };
}

// 这个辅助函数返回节点与目标节点之间连线的交点
function getNodeIntersection(
  intersectionNode: CustomNode,
  targetNode: CustomNode
) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
    intersectionNode.measured;
  const intersectionNodePosition = intersectionNode.position;
  const targetPosition = targetNode.position;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNode.measured.width / 2;
  const y1 = targetPosition.y + targetNode.measured.height / 2;

  const xx = x2 - x1;
  const yy = y2 - y1;
  const slope = yy / xx;

  let x: number, y: number;

  if (Math.abs(xx) > Math.abs(yy)) {
    // More horizontal than vertical
    if (xx < 0) {
      x = x2 - w;
    } else {
      x = x2 + w;
    }
    y = y2 + slope * (x - x2);
  } else {
    // More vertical than horizontal
    if (yy < 0) {
      y = y2 - h;
    } else {
      y = y2 + h;
    }
    x = x2 + (y - y2) / slope;
  }

  return { x, y };
}

// 返回节点相对于交点的位置（上、右、下或左）
function getEdgePosition(
  node: CustomNode,
  intersectionPoint: { x: number; y: number }
) {
  const { x, y } = node.position;
  const { height } = node.measured;

  const nx = Math.round(x);
  const ny = Math.round(y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= y + height - 1) {
    return Position.Bottom;
  }

  return Position.Right;
}

// 返回创建边所需的参数（sx, sy, tx, ty, sourcePos, targetPos）
export function getEdgeParams(
  source: InternalNode<FlowNode>,
  target: InternalNode<FlowNode>
) {
  try {
    const adaptedSource = adaptNode(source);
    const adaptedTarget = adaptNode(target);

    const sourceIntersectionPoint = getNodeIntersection(
      adaptedSource,
      adaptedTarget
    );
    const targetIntersectionPoint = getNodeIntersection(
      adaptedTarget,
      adaptedSource
    );

    const sourcePos = getEdgePosition(adaptedSource, sourceIntersectionPoint);
    const targetPos = getEdgePosition(adaptedTarget, targetIntersectionPoint);

    return {
      sx: sourceIntersectionPoint.x,
      sy: sourceIntersectionPoint.y,
      tx: targetIntersectionPoint.x,
      ty: targetIntersectionPoint.y,
      sourcePos,
      targetPos,
    };
  } catch {
    // 默认返回值，适用于节点属性不完整的情况
    return {
      sx: 0,
      sy: 0,
      tx: 0,
      ty: 0,
      sourcePos: Position.Top,
      targetPos: Position.Bottom,
    };
  }
}

export function createNodesAndEdges() {
  const nodes = [];
  const edges = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  nodes.push({ id: "target", data: { label: "Target" }, position: center });

  for (let i = 0; i < 8; i++) {
    const degrees = i * (360 / 8);
    const radians = degrees * (Math.PI / 180);
    const x = 250 * Math.cos(radians) + center.x;
    const y = 250 * Math.sin(radians) + center.y;

    nodes.push({ id: `${i}`, data: { label: "Source" }, position: { x, y } });

    edges.push({
      id: `edge-${i}`,
      target: "target",
      source: `${i}`,
      type: "floating",
      markerEnd: {
        type: MarkerType.Arrow,
      },
    });
  }

  return { nodes, edges };
}
