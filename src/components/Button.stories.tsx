import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Button } from "./Button";

export default {
  title: "Components/Button",
  component: Button,
  argTypes: {
    onClick: { action: "clicked" },
    variant: {
      control: { type: "select", options: ["primary", "secondary", "outline"] },
    },
  },
} as ComponentMeta<typeof Button>;

// Create a template for the component
const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

// Primary button
export const Primary = Template.bind({});
Primary.args = {
  variant: "primary",
  children: "Primary Button",
};

// Secondary button
export const Secondary = Template.bind({});
Secondary.args = {
  variant: "secondary",
  children: "Secondary Button",
};

// Outline button
export const Outline = Template.bind({});
Outline.args = {
  variant: "outline",
  children: "Outline Button",
};

// Disabled button
export const Disabled = Template.bind({});
Disabled.args = {
  variant: "primary",
  children: "Disabled Button",
  disabled: true,
};
