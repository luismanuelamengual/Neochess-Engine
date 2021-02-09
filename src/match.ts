import {Board} from "./board";
import {Move} from "./move";
import {MatchNode} from "./match-node";

export class Match {

    private node: MatchNode;

    constructor();
    constructor(node: MatchNode);
    constructor(board: Board);
    constructor(fen: string);
    constructor(arg?: MatchNode|Board|string) {
        if (!arg) {
            this.node = new MatchNode(new Board());
        } else {
            if (arg instanceof MatchNode) {
                this.node = arg;
            } else {
                this.node = new MatchNode(new Board(arg));
            }
        }
    }

    public startNew(board?: Board|string) {
        this.node = new MatchNode(new Board(board));
    }

    public getMatch(ply: number): Match {
        return new Match(this.node.getNode(ply));
    }

    public getMovesCount(): number {
        return this.node.getBoard().getMoveCounter();
    }

    public getBoard(ply?: number): Board {
        return ply >= 0 ? this.node.getNode(ply)?.getBoard() : this.node.getBoard();
    }

    public getFEN(ply?: number): string {
        return this.getBoard(ply).getFEN();
    }

    public getLegalMove(move: Move|string): Move {
        let legalMove: Move = null;
        const moves = this.node.getBoard().getLegalMoves(true);
        for (const testMove of moves) {
            if (move instanceof Move) {
                if (testMove.equals(move)) {
                    legalMove = testMove;
                    break;
                }
            } else {
                const testMoveSAN = testMove.getSAN();
                if (testMoveSAN == move) {
                    legalMove = testMove;
                    break;
                }
            }
        }
        return legalMove;
    }

    public isMoveLegal(move: Move|string): boolean {
        return this.getLegalMove(move) != null;
    }

    public makeMove(move: Move|string): boolean {
        let moveMade = false;
        const legalMove = this.getLegalMove(move);
        if (legalMove != null) {
            const board = this.node.getBoard().clone();
            board.makeMove(legalMove);
            const newNode = new MatchNode(board);
            this.node.addChild(legalMove, newNode);
            this.node = newNode;
            moveMade = true;
        }
        return moveMade;
    }

    public unmakeMove(): boolean {
        let moveUnmade = false;
        const currentNode = this.node;
        if (currentNode.getParentNode()) {
            this.node = currentNode.getParentNode();
            this.node.removeChild(currentNode);
            moveUnmade = true;
        }
        return moveUnmade;
    }

    public getMoveLine(): Array<Move> {
        const moves: Array<Move> = [];
        let currentMatchNode: MatchNode = this.node;
        while (currentMatchNode.getParentNode()) {
            moves[currentMatchNode.getParentNode().getBoard().getMoveCounter()] =  currentMatchNode.getParentNode().getMove(currentMatchNode);
            currentMatchNode = currentMatchNode.getParentNode();
        }
        return moves;
    }

    public setMoveLine(moves: Array<Move|string>) {
        let movesMade = true;
        this.node = new MatchNode(new Board());
        for (const move of moves) {
            if (!this.makeMove(move)) {
                movesMade = false;
                break;
            }
        }
        return movesMade;
    }

    public setComment(comment: string): Match {
        this.node.setComment(comment);
        return this;
    }

    public getComment(): string {
        return this.node.getComment();
    }

    public deleteComment(): Match {
        this.node.deleteComment();
        return this;
    }
}