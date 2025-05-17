import { observer } from "mobx-react";
import { type FC } from "react";
import { Block, Elem } from "../../../utils/bem";

/**
 * Placeholder for the new outline-style relations panel.
 */
const RelationsOutlineComponent: FC<any> = ({ relationStore }) => {
  return (
    <Block name="relations-outline">
      <Elem name="empty">Outline view coming soon</Elem>
    </Block>
  );
};

export const RelationsOutline = observer(RelationsOutlineComponent);