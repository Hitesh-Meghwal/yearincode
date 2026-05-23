import 'package:flutter/material.dart';

/// Renders an emoji as a Twemoji PNG via the jsDelivr CDN so the visual is
/// identical to the landing-page archetype deck (which uses the same source).
/// Native emoji rendering in the wasm renderer falls back to monochrome glyphs
/// for many characters; bypassing that with image bytes guarantees parity.
class TwemojiImage extends StatelessWidget {
  final String emoji;
  final double size;

  const TwemojiImage({super.key, required this.emoji, required this.size});

  static String _url(String emoji) {
    final cps = emoji.runes
        .where((r) => r != 0xFE0F)
        .map((r) => r.toRadixString(16))
        .join('-');
    return 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/$cps.png';
  }

  @override
  Widget build(BuildContext context) {
    return Image.network(
      _url(emoji),
      width: size,
      height: size,
      filterQuality: FilterQuality.high,
      // Fallback to the bare unicode if the image fails — better something
      // than nothing.
      errorBuilder: (context, error, stackTrace) => Text(
        emoji,
        style: TextStyle(fontSize: size, height: 1.0),
      ),
    );
  }
}
