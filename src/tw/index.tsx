import { Link as RouterLink } from 'expo-router';
import React from 'react';
import {
    Pressable as RNPressable,
    ScrollView as RNScrollView,
    Text as RNText,
    TextInput as RNTextInput,
    TouchableOpacity as RNTouchableOpacity,
    TouchableHighlight as RNTouchableHighlight,
    View as RNView,
    StyleSheet,
} from 'react-native';
import { useCssElement, useNativeVariable as useFunctionalVariable } from 'react-native-css';
import Animated from 'react-native-reanimated';

export const Link = (props: React.ComponentProps<typeof RouterLink> & { className?: string }) => {
  return (useCssElement as any)(RouterLink, props, { className: 'style' });
};

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

export const useCSSVariable =
  process.env.EXPO_OS !== 'web' ? useFunctionalVariable : (variable: string) => `var(${variable})`;

export type ViewProps = React.ComponentProps<typeof RNView> & { className?: string };

export const View = (props: ViewProps) => {
  return (useCssElement as any)(RNView, props, { className: 'style' });
};
View.displayName = 'CSS(View)';

const BaseText = React.forwardRef<RNText, React.ComponentProps<typeof RNText>>((props, ref) => {
  return <RNText ref={ref} {...props} style={[props.style, { fontFamily: 'SVN-PFDinTextPro-CondensedBold', fontWeight: 'normal' }]} />;
});

export const Text = (props: React.ComponentProps<typeof RNText> & { className?: string }) => {
  return (useCssElement as any)(BaseText, props, { className: 'style' });
};
Text.displayName = 'CSS(Text)';

export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & { className?: string; contentContainerClassName?: string }
) => {
  return (useCssElement as any)(RNScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
};
ScrollView.displayName = 'CSS(ScrollView)';

export const Pressable = (props: React.ComponentProps<typeof RNPressable> & { className?: string }) => {
  return (useCssElement as any)(RNPressable, props, { className: 'style' });
};
Pressable.displayName = 'CSS(Pressable)';

export const TouchableOpacity = (
  props: React.ComponentProps<typeof RNTouchableOpacity> & { className?: string }
) => {
  return (useCssElement as any)(RNTouchableOpacity, props, { className: 'style' });
};
TouchableOpacity.displayName = 'CSS(TouchableOpacity)';

const BaseTextInput = React.forwardRef<RNTextInput, React.ComponentProps<typeof RNTextInput>>((props, ref) => {
  return <RNTextInput ref={ref} {...props} style={[{ fontFamily: 'SVN-PFDinTextPro-CondensedBold' }, props.style]} />;
});

export const TextInput = (props: React.ComponentProps<typeof RNTextInput> & { className?: string }) => {
  return (useCssElement as any)(BaseTextInput, props, { className: 'style' });
};
TextInput.displayName = 'CSS(TextInput)';

export const AnimatedScrollView = (
  props: React.ComponentProps<typeof Animated.ScrollView> & {
    className?: string;
    contentClassName?: string;
    contentContainerClassName?: string;
  }
) => {
  return (useCssElement as any)(Animated.ScrollView, props, {
    className: 'style',
    contentClassName: 'contentContainerStyle',
    contentContainerClassName: 'contentContainerStyle',
  });
};

function TouchableHighlightBase(props: React.ComponentProps<typeof RNTouchableHighlight>) {
  const { underlayColor, ...style } = (StyleSheet.flatten(props.style) as any) || {};
  return <RNTouchableHighlight underlayColor={underlayColor} {...props} style={style} />;
}

export const TouchableHighlight = (props: React.ComponentProps<typeof RNTouchableHighlight>) => {
  return (useCssElement as any)(TouchableHighlightBase, props, { className: 'style' });
};
TouchableHighlight.displayName = 'CSS(TouchableHighlight)';
