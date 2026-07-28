import { ImageProps as ExpoImageProps, Image as RNImage } from 'expo-image';
import React from 'react';
import { ImageStyle, StyleSheet } from 'react-native';
import { useCssElement } from 'react-native-css';
import Animated, { AnimatedProps } from 'react-native-reanimated';

const AnimatedExpoImage = Animated.createAnimatedComponent(RNImage);

type ExtendedStyle = ImageStyle & {
  objectFit?: ExpoImageProps['contentFit'];
  objectPosition?: ExpoImageProps['contentPosition'];
};

// Use AnimateProps helper instead of raw AnimatedProps<Readonly<...>>
type CSSImageProps = AnimatedProps<ExpoImageProps> & {
  className?: string;
};

function CSSImage(props: CSSImageProps) {
  const flattenedStyle = (StyleSheet.flatten(props.style as any) || {}) as ExtendedStyle;
  const { objectFit, objectPosition, ...style } = flattenedStyle;

  return (
    <AnimatedExpoImage
      contentFit={objectFit}
      contentPosition={objectPosition}
      {...props}
      source={typeof props.source === 'string' ? { uri: props.source } : props.source}
      style={style}
    />
  );
}

export const Image = (props: React.ComponentProps<typeof CSSImage> & { className?: string }) => {
  return useCssElement(CSSImage, props, { className: 'style' });
};

Image.displayName = 'CSS(Image)';