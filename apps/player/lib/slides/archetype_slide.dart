import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

class ArchetypeSlide extends StatefulWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const ArchetypeSlide({super.key, required this.stats, required this.theme});

  @override
  State<ArchetypeSlide> createState() => _ArchetypeSlideState();
}

class _ArchetypeSlideState extends State<ArchetypeSlide>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _scale = CurvedAnimation(parent: _controller, curve: Curves.easeOutBack);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final a = widget.stats.archetype;
    final theme = widget.theme;
    return SlideScaffold(
      theme: theme,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FadeIn(
              delay: const Duration(milliseconds: 100),
              child: const Text(
                'You are…',
                style: TextStyle(color: Colors.white60, fontSize: 22),
              ),
            ),
            const SizedBox(height: 24),
            AnimatedBuilder(
              animation: _scale,
              builder: (context, _) => Transform.scale(
                scale: 0.6 + 0.4 * _scale.value,
                child: Text(
                  a.emoji,
                  style: const TextStyle(fontSize: 120),
                ),
              ),
            ),
            const SizedBox(height: 16),
            FadeIn(
              delay: const Duration(milliseconds: 700),
              child: Text(
                a.name,
                style: TextStyle(
                  color: theme.primary,
                  fontSize: 34,
                  fontWeight: FontWeight.w900,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 12),
            FadeIn(
              delay: const Duration(milliseconds: 1100),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: theme.secondary.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  _rarityLabel(a.rarity),
                  style: TextStyle(
                    color: theme.secondary,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            FadeIn(
              delay: const Duration(milliseconds: 1500),
              child: Text(
                a.description,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 16,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

String _rarityLabel(String rarity) {
  switch (rarity) {
    case 'legendary':
      return 'LEGENDARY ✨';
    case 'rare':
      return 'RARE ✨';
    case 'uncommon':
      return 'UNCOMMON';
    default:
      return 'COMMON';
  }
}
