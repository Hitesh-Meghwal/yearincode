import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/confetti_burst.dart';
import 'slide_scaffold.dart';

/// "Trading card / poster." A rotated Polaroid-style frame holds the emoji and
/// archetype name. A big rotated rarity stamp sits outside the frame. Confetti
/// bursts on entry. The killer-feature slide.
class ArchetypeSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const ArchetypeSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final a = stats.archetype;
    return SlideScaffold(
      theme: theme,
      backgroundSeed: 23,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Mono caption — top-left editorial label.
          Positioned(
            left: 28,
            top: 60,
            child: FadeIn(
              slideFrom: const Offset(-0.1, 0),
              child: Text(
                '// YOU ARE',
                style: TextStyle(
                  color: theme.secondary,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2.4,
                ),
              ),
            ),
          ),

          // The Polaroid card — slightly rotated, asymmetric.
          Center(
            child: ScaleIn(
              from: 0.6,
              delay: const Duration(milliseconds: 250),
              duration: const Duration(milliseconds: 900),
              child: Transform.rotate(
                angle: -0.04,
                child: _PolaroidCard(archetype: a, theme: theme),
              ),
            ),
          ),

          // Rarity stamp — outside the frame, rotated sticker. Inside safe.
          Positioned(
            right: 28,
            top: 110,
            child: FadeIn(
              delay: const Duration(milliseconds: 900),
              slideFrom: const Offset(0.15, 0),
              child: Transform.rotate(
                angle: -0.08,
                child: _RarityStamp(
                  text: _rarityLabel(a.rarity),
                  fill: theme.secondary,
                ),
              ),
            ),
          ),

          // Confetti, overlaid on everything.
          Positioned.fill(
            child: ConfettiBurst(
              colors: [theme.primary, theme.secondary, Colors.white],
              delay: const Duration(milliseconds: 400),
              particleCount: 80,
              duration: const Duration(milliseconds: 3600),
            ),
          ),
        ],
      ),
    );
  }
}

class _PolaroidCard extends StatelessWidget {
  final Archetype archetype;
  final ArchetypeTheme theme;
  const _PolaroidCard({required this.archetype, required this.theme});

  @override
  Widget build(BuildContext context) {
    // Lightly tinted primary fill (~20%) keeps the card readable on top of
    // the scaffold's drifting background but still has color identity.
    final cardFill = Color.alphaBlend(
      theme.primary.withValues(alpha: 0.22),
      const Color(0xFFF6F1E7), // warm off-white, polaroid paper
    );

    return Container(
      width: 280,
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 22),
      decoration: BoxDecoration(
        color: cardFill,
        border: Border.all(color: Colors.black, width: 3),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Emoji "photo" area — solid color rectangle with the emoji centered.
          Container(
            height: 172,
            decoration: BoxDecoration(
              color: theme.background.withValues(alpha: 0.92),
              border: Border.all(color: Colors.black, width: 2),
            ),
            alignment: Alignment.center,
            child: Text(
              archetype.emoji,
              style: const TextStyle(fontSize: 124, height: 1),
            ),
          ),
          const SizedBox(height: 16),

          // Archetype name — bold, left-aligned editorial. FittedBox keeps a
          // long name (e.g. "The Quantum Refactorer") on a single line within
          // the polaroid width rather than spilling out.
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              archetype.name,
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.visible,
              style: const TextStyle(
                color: Colors.black,
                fontSize: 26,
                fontWeight: FontWeight.w900,
                height: 1.0,
                letterSpacing: -1,
              ),
            ),
          ),
          const SizedBox(height: 6),

          // Description — small italic caption. Capped at 4 lines so a
          // verbose blurb cannot push the card past the bottom of the slide.
          Text(
            archetype.description,
            maxLines: 4,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.black.withValues(alpha: 0.7),
              fontSize: 11,
              fontStyle: FontStyle.italic,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}

class _RarityStamp extends StatelessWidget {
  final String text;
  final Color fill;
  const _RarityStamp({required this.text, required this.fill});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
      decoration: BoxDecoration(
        color: fill,
        border: Border.all(color: Colors.black, width: 3),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.black,
          fontSize: 17,
          fontWeight: FontWeight.w900,
          letterSpacing: 2,
          fontFamily: 'monospace',
          height: 1,
        ),
      ),
    );
  }
}

String _rarityLabel(String rarity) {
  switch (rarity) {
    case 'legendary':
      return 'LEGENDARY';
    case 'rare':
      return 'RARE';
    case 'uncommon':
      return 'UNCOMMON';
    default:
      return 'COMMON';
  }
}
