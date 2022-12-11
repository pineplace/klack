import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Title, Description } from "@storybook/addon-docs";
import PopupMenu from "./popup_menu";

export default {
  title: "RapidRec/PopupMenu",
  component: PopupMenu,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title>PopupMenu</Title>
          <Description>This menu shows on extension popup click</Description>
          <PopupMenu />
        </>
      ),
    },
  },
} as ComponentMeta<typeof PopupMenu>;

const Template: ComponentStory<typeof PopupMenu> = () => <PopupMenu />;

export const Light = Template.bind({});
