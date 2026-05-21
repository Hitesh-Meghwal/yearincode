import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

class TopRepoSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const TopRepoSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final repo = stats.topRepos.isNotEmpty ? stats.topRepos.first : null;
    return SlideScaffold(
      theme: theme,
      backgroundSeed: 71,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SlideTitle('Your main character was'),
            const SizedBox(height: 24),
            FadeIn(
              slideFrom: const Offset(0, 0.15),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.05),
                  border: Border.all(
                    color: theme.primary.withValues(alpha: 0.4),
                    width: 1.5,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.folder_outlined,
                            color: theme.primary, size: 20),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            repo?.name ?? 'no repos',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ShaderMask(
                      shaderCallback: (rect) => LinearGradient(
                        colors: [theme.primary, theme.secondary],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ).createShader(rect),
                      child: Text(
                        '${repo?.commits ?? 0}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 92,
                          fontWeight: FontWeight.w900,
                          height: 0.9,
                          letterSpacing: -3,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'commits',
                      style: TextStyle(
                        color: Colors.white60,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (repo?.isPrivate ?? false) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text('private',
                            style: TextStyle(
                                color: Colors.white70, fontSize: 12)),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            FadeIn(
              delay: const Duration(milliseconds: 900),
              child: Text(
                '${stats.totalRepos} repos in total',
                style: const TextStyle(color: Colors.white60),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
