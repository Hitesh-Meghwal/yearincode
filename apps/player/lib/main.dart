import 'dart:convert';
import 'dart:js_interop';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'demo_stats.dart';
import 'models/wrapped_stats.dart';
import 'themes/archetype_themes.dart';
import 'widgets/slide_controller.dart';
import 'slides/intro_slide.dart';
import 'slides/commits_slide.dart';
import 'slides/lines_slide.dart';
import 'slides/languages_slide.dart';
import 'slides/peak_hour_slide.dart';
import 'slides/top_repo_slide.dart';
import 'slides/streak_slide.dart';
import 'slides/collaborator_slide.dart';
import 'slides/archetype_slide.dart';
import 'slides/outro_slide.dart';

void main() {
  runApp(const PlayerApp());
}

class PlayerApp extends StatelessWidget {
  const PlayerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'yearincode',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black,
        textTheme: const TextTheme().apply(
          bodyColor: Colors.white,
          displayColor: Colors.white,
        ),
      ),
      home: const PlayerHome(),
    );
  }
}

class PlayerHome extends StatelessWidget {
  const PlayerHome({super.key});

  @override
  Widget build(BuildContext context) {
    final stats = _loadStats();
    final theme = themeForArchetype(stats.archetype.id);

    final slides = <Widget>[
      IntroSlide(stats: stats, theme: theme),
      CommitsSlide(stats: stats, theme: theme),
      LinesSlide(stats: stats, theme: theme),
      LanguagesSlide(stats: stats, theme: theme),
      PeakHourSlide(stats: stats, theme: theme),
      TopRepoSlide(stats: stats, theme: theme),
      StreakSlide(stats: stats, theme: theme),
      CollaboratorSlide(stats: stats, theme: theme),
      ArchetypeSlide(stats: stats, theme: theme),
      OutroSlide(stats: stats, theme: theme),
    ];

    final durations = const [
      Duration(seconds: 4), // intro
      Duration(seconds: 5), // commits
      Duration(seconds: 5), // lines
      Duration(seconds: 5), // languages
      Duration(seconds: 5), // peak hour
      Duration(seconds: 5), // top repo
      Duration(seconds: 5), // streak
      Duration(seconds: 5), // collaborator
      Duration(seconds: 6), // archetype (emphasis)
      Duration(seconds: 6), // outro (viral)
    ];

    // Fixed design canvas approach: every slide is laid out in a 540×960
    // virtual frame, then FittedBox(contain) scales the whole thing to the
    // actual iframe size. This means absolute Positioned coordinates in any
    // slide always work — overflow is impossible because the canvas itself
    // is bounded. The iframe wrapper enforces a 9:16 aspect ratio so there's
    // never letterboxing — just uniform scaling.
    //
    // ClipRRect inside the canvas matches the parent iframe's tiny rounded
    // corners so content positioned at the edges (intentionally bleeding
    // stickers, full-bleed bars, etc.) doesn't visually clip against the
    // parent's mask on any device size.
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: FittedBox(
          fit: BoxFit.contain,
          child: SizedBox(
            width: 540,
            height: 960,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: SlideController(
                slides: slides,
                durations: durations,
                onEnded: _onEnded,
              ),
            ),
          ),
        ),
      ),
    );
  }

  WrappedStats _loadStats() {
    if (kIsWeb) {
      try {
        final params = Uri.base.queryParameters;
        final raw = params['stats'];
        if (raw != null && raw.isNotEmpty) {
          final bytes = base64Url.decode(_padBase64(raw));
          final jsonStr = utf8.decode(bytes);
          final map = jsonDecode(jsonStr) as Map<String, dynamic>;
          return WrappedStats.fromJson(map);
        }
      } catch (e, st) {
        debugPrint('[player] failed to parse ?stats=: $e\n$st');
      }
    }
    return WrappedStats.fromJson(demoStatsJson);
  }

  static String _padBase64(String raw) {
    final mod = raw.length % 4;
    if (mod == 0) return raw;
    return raw + '=' * (4 - mod);
  }

  static void _onEnded() {
    if (!kIsWeb) return;
    try {
      _notifyWrappedEnded();
    } catch (e) {
      debugPrint('[player] notifyWrappedEnded failed: $e');
    }
  }
}

// Bridged to the global function defined in web/index.html, which postMessages
// `{ type: 'wrapped:ended' }` to the parent window.
@JS('notifyWrappedEnded')
external void _notifyWrappedEnded();
