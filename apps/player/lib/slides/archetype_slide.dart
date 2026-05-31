import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/confetti_burst.dart';
import '../widgets/motion.dart';
import '../widgets/twemoji_image.dart';
import '../themes/wrapped_palette.dart';
import 'slide_scaffold.dart';

/// Number of confetti particles per rarity tier — rarer reveals burst harder.
int _confettiCountFor(String rarity) {
  switch (rarity) {
    case 'legendary':
      return 160;
    case 'rare':
      return 120;
    case 'uncommon':
      return 90;
    default:
      return 70;
  }
}

/// A soft, slowly-breathing radial glow placed behind the archetype emoji so
/// the reveal feels lit from within. Honors reduced-motion by holding a
/// static glow instead of pulsing.
class _GlowHalo extends StatefulWidget {
  final Color color;
  const _GlowHalo({required this.color});
  @override
  State<_GlowHalo> createState() => _GlowHaloState();
}

class _GlowHaloState extends State<_GlowHalo>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _c = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (!reduceMotionOf(context)) _c.repeat(reverse: true);
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Widget halo(double t) {
      final alpha = 0.28 + 0.18 * t;
      final scale = 0.9 + 0.12 * t;
      return Transform.scale(
        scale: scale,
        child: Container(
          width: 240,
          height: 240,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                widget.color.withValues(alpha: alpha),
                widget.color.withValues(alpha: 0.0),
              ],
              stops: const [0.0, 1.0],
            ),
          ),
        ),
      );
    }

    if (reduceMotionOf(context)) return halo(0.5);
    return AnimatedBuilder(
      animation: _c,
      builder: (context, _) =>
          halo(Curves.easeInOut.transform(_c.value)),
    );
  }
}

/// Wrapped Pattern C — headline / reveal. The archetype emoji is the
/// centerpiece, with the archetype name as a big headline below.
/// Rarity word in caps, description as a small caption. Confetti
/// overlays everything for the reveal moment.
class ArchetypeSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const ArchetypeSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final a = stats.archetype;
    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.archetype,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Bespoke world-map backdrop, ONLY for the Globe Trotter archetype.
          // Treats this rare card like a legendary unlock — most users never
          // see it, the ones who earn it get art the others don't.
          if (a.id == 'globe-trotter')
            Positioned.fill(
              child: IgnorePointer(
                child: Opacity(
                  opacity: 0.16,
                  child: SvgPicture.asset(
                    'assets/maps/world.svg',
                    fit: BoxFit.cover,
                    colorFilter: const ColorFilter.mode(
                      Colors.white,
                      BlendMode.srcIn,
                    ),
                  ),
                ),
              ),
            ),

          // Kicker — top-left.
          Positioned(
            top: 56,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 100),
              child: const _WrappedKicker(text: 'YOU ARE'),
            ),
          ),

          // Hero block — emoji + headline + rarity + description.
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(32, 110, 32, 90),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // The emoji — Twemoji image so the visual matches the
                  // landing-page archetype deck exactly. A pulsing themed glow
                  // halo sits behind it so the reveal reads as an "unlock".
                  ScaleIn(
                    delay: const Duration(milliseconds: 200),
                    from: 0.5,
                    duration: const Duration(milliseconds: 900),
                    child: SizedBox(
                      width: 240,
                      height: 240,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          _GlowHalo(color: theme.primary),
                          GentlePulse(
                            child: TwemojiImage(emoji: a.emoji, size: 150),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 22),
                  // Headline.
                  FadeIn(
                    delay: const Duration(milliseconds: 450),
                    slideFrom: const Offset(0, 0.06),
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        a.name,
                        maxLines: 1,
                        softWrap: false,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 56,
                          fontWeight: FontWeight.w400,
                          height: 1.1,
                          letterSpacing: -0.8,
                          fontFamily: 'Boldonse',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  // Rarity word.
                  FadeIn(
                    delay: const Duration(milliseconds: 600),
                    child: Text(
                      _rarityLabel(a.rarity),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2.8,
                        fontFamily: 'DepartureMono',
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  // Description.
                  if (a.description.isNotEmpty)
                    FadeIn(
                      delay: const Duration(milliseconds: 750),
                      child: Text(
                        a.description,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.72),
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          height: 1.45,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Confetti — overlays everything. Rarer archetypes get a denser
          // burst so a legendary reveal genuinely feels bigger than a common.
          Positioned.fill(
            child: IgnorePointer(
              child: ConfettiBurst(
                colors: [theme.primary, theme.secondary, Colors.white],
                delay: const Duration(milliseconds: 400),
                particleCount: _confettiCountFor(a.rarity),
                duration: const Duration(milliseconds: 3600),
              ),
            ),
          ),

          _WrappedWordmark(year: stats.year, username: stats.username),
        ],
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

class _WrappedKicker extends StatelessWidget {
  final String text;
  const _WrappedKicker({required this.text});
  @override
  Widget build(BuildContext context) => Text(
        text,
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.85),
          fontFamily: 'DepartureMono',
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 2.2,
        ),
      );
}

class _WrappedWordmark extends StatelessWidget {
  final int year;
  final String username;
  const _WrappedWordmark({required this.year, required this.username});
  @override
  Widget build(BuildContext context) {
    return Positioned(
      right: 28,
      bottom: 28,
      child: Text(
        'yearincode  ·  $year  ·  @$username',
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.55),
          fontFamily: 'DepartureMono',
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
