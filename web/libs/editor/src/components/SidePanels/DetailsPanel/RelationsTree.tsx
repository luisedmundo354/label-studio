import { observer } from "mobx-react";
import { type FC } from "react";
import { Block, Elem } from "../../../utils/bem";

const RelationsTreeComponent: FC<any> = ({ relationStore }) => {
  return (
    <Block name="relations-tree">
      <Elem name="empty">Tree view coming soon</Elem>
    </Block>
  );
};

export const RelationsTree = observer(RelationsTreeComponent);
