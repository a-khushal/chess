import { defaultPieces, type PieceRenderObject } from "react-chessboard";

const WHITE_FILL = "#f4f4f4";
const BLACK_FILL = "#757575";

export const MONO_PIECES = {
  wP: (props) => defaultPieces.wP!({ ...props, fill: WHITE_FILL }),
  wR: (props) => defaultPieces.wR!({ ...props, fill: WHITE_FILL }),
  wN: (props) => defaultPieces.wN!({ ...props, fill: WHITE_FILL }),
  wB: (props) => defaultPieces.wB!({ ...props, fill: WHITE_FILL }),
  wQ: (props) => defaultPieces.wQ!({ ...props, fill: WHITE_FILL }),
  wK: (props) => defaultPieces.wK!({ ...props, fill: WHITE_FILL }),
  bP: (props) => defaultPieces.bP!({ ...props, fill: BLACK_FILL }),
  bR: (props) => defaultPieces.bR!({ ...props, fill: BLACK_FILL }),
  bN: (props) => defaultPieces.bN!({ ...props, fill: BLACK_FILL }),
  bB: (props) => defaultPieces.bB!({ ...props, fill: BLACK_FILL }),
  bQ: (props) => defaultPieces.bQ!({ ...props, fill: BLACK_FILL }),
  bK: (props) => defaultPieces.bK!({ ...props, fill: BLACK_FILL }),
} satisfies PieceRenderObject;
