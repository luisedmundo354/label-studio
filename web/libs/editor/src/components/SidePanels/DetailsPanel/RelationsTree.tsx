import { observer } from "mobx-react";
import { type FC } from "react";
import { Block, Elem } from "../../../utils/bem";
import PremisesTree from "./tree";

const RelationsTreeComponent: FC<any> = ({ relationStore }) => (
  <Block name="relations-tree">
    <Elem name="tree-wrapper">
      <PremisesTree relationStore={relationStore} />
    </Elem>
  </Block>
);

export const RelationsTree = observer(RelationsTreeComponent);
