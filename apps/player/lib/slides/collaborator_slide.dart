import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

class CollaboratorSlide extends StatefulWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const CollaboratorSlide({
    super.key,
    required this.stats,
    required this.theme,
  });

  @override
  State<CollaboratorSlide> createState() => _CollaboratorSlideState();
}

class _CollaboratorSlideState extends State<CollaboratorSlide>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stats = widget.stats;
    final theme = widget.theme;
    final collab = stats.topCollaborators.isNotEmpty
        ? stats.topCollaborators.first
        : null;

    return SlideScaffold(
      theme: theme,
      backgroundSeed: 127,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (collab == null) ...[
              const Text(
                '🐺',
                style: TextStyle(fontSize: 72),
              ),
              const SizedBox(height: 16),
              const SlideTitle('No co-committers detected this year'),
              const SizedBox(height: 8),
              Text(
                'You and your editor, alone in the woods.',
                style: TextStyle(color: theme.secondary, fontSize: 16),
                textAlign: TextAlign.center,
              ),
            ] else ...[
              const SlideTitle('You + this person shipped together'),
              const SizedBox(height: 32),
              SizedBox(
                width: 240,
                height: 180,
                child: AnimatedBuilder(
                  animation: _controller,
                  builder: (context, _) {
                    final a = _controller.value * 2 * math.pi;
                    final r = 50.0;
                    return Stack(
                      alignment: Alignment.center,
                      children: [
                        Positioned(
                          left: 120 - 32 + math.cos(a) * r,
                          top: 90 - 32 + math.sin(a) * r,
                          child: _Avatar(
                              label: stats.username, color: theme.primary),
                        ),
                        Positioned(
                          left: 120 - 32 + math.cos(a + math.pi) * r,
                          top: 90 - 32 + math.sin(a + math.pi) * r,
                          child: _Avatar(
                              label: collab.username, color: theme.secondary),
                        ),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              Text(
                '@${collab.username}',
                style: TextStyle(
                  color: theme.secondary,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${collab.sharedCommits} shared commits',
                style: const TextStyle(color: Colors.white70, fontSize: 16),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final String label;
  final Color color;
  const _Avatar({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    final initial = label.isNotEmpty ? label[0].toUpperCase() : '?';
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.5),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Center(
        child: Text(
          initial,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}
