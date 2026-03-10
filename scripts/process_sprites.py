from PIL import Image
import numpy as np
import os, json, re

BASE = r'C:/Users/ABK/Desktop/Projects/gothicvania/public/assets/unwrapped-assets'
OUT  = r'C:/Users/ABK/Desktop/Projects/gothicvania/public/assets/characters'
os.makedirs(OUT, exist_ok=True)

TARGET_H = 60

CHARS = {
    'archer': {
        'src': 'Archer',
        'content_h': 45,
        'anims': {
            'idle':   'spr_ArcherIdle_strip_NoBkg.png',
            'run':    'spr_ArcherRun_strip_NoBkg.png',
            'jump':   ('spr_ArcherJumpAndFall_strip_NoBkg.png', '0:6'),
            'fall':   ('spr_ArcherJumpAndFall_strip_NoBkg.png', '6:12'),
            'attack': {'file': 'spr_ArcherAttack_strip_NoBkg.png', 'slice': '0:10', 'fw': 180},
            'hurt':   ('spr_ArcherDeath_strip_NoBkg.png', '0:4'),
        },
    },
    'barbarian': {
        'src': 'Barbarian',
        'frame_w': 170,
        'content_h': 45,
        'anims': {
            'idle':   ('spr_Idle_strip.png', '0:8'),
            'run':    ('spr_Walk_strip.png', '0:8'),
            'jump':   {'file': 'spr_Jump_strip.png', 'slice': '0:8', 'fw': 125},
            'fall':   {'file': 'spr_Jump_strip.png', 'slice': '24:32', 'fw': 125},
            'attack': ('spr_Attack_strip.png', '0:12'),
            'hurt':   ('spr_Death_strip.png', '0:4'),
        },
    },
    'knight': {
        'src': 'Knight',
        'frame_w': 144,
        'content_h': 45,
        'anims': {
            'idle':   {'file': 'noBKG_KnightIdle_strip.png', 'fw': 64},
            'run':    {'file': 'noBKG_KnightRun_strip.png', 'fw': 64},
            'jump':   ('noBKG_KnightJumpAndFall_strip.png', '0:5'),
            'fall':   ('noBKG_KnightJumpAndFall_strip.png', '8:15'),
            'attack': ('noBKG_KnightAttack_strip.png', '0:11'),
            'hurt':   ('noBKG_KnightDeath_strip.png', '0:4'),
        },
    },
    'king': {
        'src': 'King/NoBkgColor',
        'anims': {
            'idle':   ('spr_KingIdle_strip_no_bkg.png', '0:8'),
            'run':    'spr_KingWalk_strip_no_bkg.png',
            'jump':   ('spr_KingIdle_strip_no_bkg.png', '0:4'),
            'fall':   ('spr_KingIdle_strip_no_bkg.png', '4:8'),
            'attack': ('spr_KingGroundAttack_strip_no_bkg.png', '0:12'),
            'hurt':   ('spr_KingDeath_strip_no_bkg.png', '0:4'),
        },
    },
    'necromancer': {
        'src': 'Necromancer',
        'anims': {
            'idle':   ('Idle/spr_NecromancerIdle_strip50.png', '0:8'),
            'run':    'Walk/spr_NecromancerWalk_strip10.png',
            'jump':   ('Jump/spr_NecromancerIdle_strip50.png', '0:6'),
            'fall':   ('Jump/spr_NecromancerIdle_strip50.png', '6:12'),
            'attack': ('Attack/spr_NecromancerAttackWithEffect_strip47.png', '0:12'),
            'hurt':   ('GetHit/spr_NecromancerGetHit_strip9.png', '0:4'),
        },
    },
    'paladin': {
        'src': 'Paladin',
        'anims': {
            'idle':   ('Idle/spr_PaladinIdle_strip27.png', '0:8'),
            'run':    'Walk/spr_PaladinWalk_strip10.png',
            'jump':   ('Jump/spr_PaladinJump_strip13.png', '0:6'),
            'fall':   ('Jump/spr_PaladinJump_strip13.png', '6:13'),
            'attack': ('Attack/spr_PaladinAttackWithEffect_strip41.png', '0:12'),
            'hurt':   ('GetHit/spr_PaladinGetHitWithEffect_strip12.png', '0:4'),
        },
    },
    'goblin': {
        'src': 'Monsters/Goblin',
        'anims': {
            'idle':   'Idle.png',
            'run':    'Run.png',
            'jump':   ('Run.png', '0:4'),
            'fall':   ('Run.png', '4:8'),
            'attack': 'Attack.png',
            'hurt':   'Take Hit.png',
        },
    },
    'skeleton': {
        'src': 'Monsters/Skeleton',
        'anims': {
            'idle':   'Idle.png',
            'run':    'Walk.png',
            'jump':   ('Walk.png', '0:2'),
            'fall':   ('Walk.png', '2:4'),
            'attack': 'Attack.png',
            'hurt':   'Take Hit.png',
        },
    },
    'mushroom': {
        'src': 'Monsters/Mushroom',
        'anims': {
            'idle':   'Idle.png',
            'run':    'Run.png',
            'jump':   ('Run.png', '0:4'),
            'fall':   ('Run.png', '4:8'),
            'attack': 'Attack.png',
            'hurt':   'Take Hit.png',
        },
    },
    'flyingeye': {
        'src': 'Monsters/Flying eye',
        'anims': {
            'idle':   'Flight.png',
            'run':    'Flight.png',
            'jump':   ('Flight.png', '0:4'),
            'fall':   ('Flight.png', '4:8'),
            'attack': 'Attack.png',
            'hurt':   'Take Hit.png',
        },
    },
    'rat': {
        'src': 'Monsters/Rat',
        'target_h': 24,
        'anims': {
            'idle':   'rat-idle.png',
            'run':    'rat-run.png',
            'jump':   ('rat-run.png', '0:3'),
            'fall':   ('rat-run.png', '3:6'),
            'attack': 'rat-attack.png',
            'hurt':   'rat-hurt.png',
        },
    },
}


def get_grid_frame_width(filename, img_w, img_h):
    """Determine frame width using grid-based approach (not content detection)."""
    # 1) _stripN in filename
    m = re.search(r'_strip(\d+)', filename)
    if m:
        n = int(m.group(1))
        if n > 0 and img_w % n == 0:
            return img_w // n

    # 2) Square frames (width divisible by height)
    if img_w % img_h == 0 and img_w > img_h:
        return img_h

    # 3) Try common frame widths
    for fw in [160, 150, 128, 96, 80, 64, 48, 32]:
        if img_w % fw == 0:
            return fw

    # 4) Fallback: treat entire image as one frame
    return img_w


def process_anim(char_name, anim_name, src_path, frame_slice, target_h, override_fw=None, content_h=None):
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size
    arr = np.array(img)

    fname = os.path.basename(src_path)

    if override_fw:
        fw = override_fw
    else:
        fw = get_grid_frame_width(fname, w, h)

    n_total = w // fw
    if n_total == 0:
        n_total = 1
        fw = w

    # Apply slice
    start_idx = 0
    end_idx = n_total
    if frame_slice:
        start_idx, end_idx = frame_slice
        end_idx = min(end_idx, n_total)
        start_idx = min(start_idx, n_total)

    n_frames = end_idx - start_idx
    if n_frames <= 0:
        print(f'  WARNING: {char_name}-{anim_name}: no frames in range {start_idx}:{end_idx} (total={n_total})')
        return None

    # Content-aware scaling: measure source content height and scale to match
    if content_h:
        # Find global content bounds across all selected frames
        global_y_min = h
        global_y_max = 0
        global_x_min = fw
        global_x_max = 0
        for i in range(n_frames):
            src_x = (start_idx + i) * fw
            frame = arr[:, src_x:src_x + fw]
            alpha = frame[:, :, 3]
            rows_with = np.any(alpha > 10, axis=1)
            cols_with = np.any(alpha > 10, axis=0)
            if np.any(rows_with):
                y0 = int(np.argmax(rows_with))
                y1 = int(h - 1 - np.argmax(rows_with[::-1]))
                global_y_min = min(global_y_min, y0)
                global_y_max = max(global_y_max, y1)
            if np.any(cols_with):
                x0 = int(np.argmax(cols_with))
                x1 = int(fw - 1 - np.argmax(cols_with[::-1]))
                global_x_min = min(global_x_min, x0)
                global_x_max = max(global_x_max, x1)

        src_content_h = global_y_max - global_y_min + 1
        if src_content_h <= 0:
            src_content_h = h

        scale = content_h / src_content_h
        # Add padding: 7px top (headroom like warrior), rest below
        pad_top = 7
        out_h = content_h + pad_top
        # Crop source rows to content + proportional margin
        src_y_start = max(0, global_y_min - round(pad_top / scale))
        src_y_end = min(h, global_y_max + 1)
        # Width: crop to content + symmetric padding
        src_content_w = global_x_max - global_x_min + 1
        pad_x_src = max(4, round(8 / scale))  # ~8px padding each side in output
        src_x_start = max(0, global_x_min - pad_x_src)
        src_x_end = min(fw, global_x_max + 1 + pad_x_src)
        crop_w = src_x_end - src_x_start
        new_fw = max(1, round(crop_w * scale))
    else:
        scale = target_h / h
        out_h = target_h
        new_fw = max(1, round(fw * scale))
        src_y_start = 0
        src_y_end = h
        src_x_start = 0
        crop_w = fw

    # Build output strip
    strip = np.zeros((out_h, new_fw * n_frames, 4), dtype=np.uint8)
    for i in range(n_frames):
        src_x = (start_idx + i) * fw
        frame = arr[src_y_start:src_y_end, src_x + src_x_start:src_x + src_x_start + crop_w]
        frame_img = Image.fromarray(frame)
        scaled = frame_img.resize((new_fw, out_h), Image.LANCZOS)
        strip[:, i * new_fw:(i + 1) * new_fw] = np.array(scaled)

    out_dir = os.path.join(OUT, char_name)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f'{char_name}-{anim_name}.png')
    Image.fromarray(strip).save(out_path)
    return {'frames': n_frames, 'cellW': new_fw, 'cellH': out_h}


# ── Process ──────────────────────────────────────────────────────────────────
manifest = {}
for char_name, cfg in CHARS.items():
    print(f'Processing {char_name}...')
    char_target_h = cfg.get('target_h', TARGET_H)
    char_content_h = cfg.get('content_h', None)
    override_fw = cfg.get('frame_w', None)
    manifest[char_name] = {'cellH': char_target_h, 'anims': {}}

    src_base = os.path.join(BASE, cfg['src'])

    for anim_name, anim_cfg in cfg['anims'].items():
        anim_fw = override_fw  # per-character default
        if isinstance(anim_cfg, dict):
            filename = anim_cfg['file']
            slice_str = anim_cfg.get('slice')
            if slice_str:
                s, e = map(int, slice_str.split(':'))
                frame_slice = (s, e)
            else:
                frame_slice = None
            if 'fw' in anim_cfg:
                anim_fw = anim_cfg['fw']
        elif isinstance(anim_cfg, tuple):
            filename, slice_str = anim_cfg
            s, e = map(int, slice_str.split(':'))
            frame_slice = (s, e)
        else:
            filename = anim_cfg
            frame_slice = None

        src_path = os.path.join(src_base, filename)
        if not os.path.exists(src_path):
            print(f'  MISSING: {src_path}')
            continue

        result = process_anim(char_name, anim_name, src_path, frame_slice, char_target_h, anim_fw, char_content_h)
        if result:
            manifest[char_name]['anims'][anim_name] = result
            if anim_name == 'idle':
                manifest[char_name]['cellW'] = result['cellW']
                manifest[char_name]['cellH'] = result['cellH']
            print(f'  {anim_name}: {result["frames"]} frames @ {result["cellW"]}x{result["cellH"]}')

# ── Measure body dimensions from idle frame ──────────────────────────────────
print('\n--- Body measurements ---')
for char_name in manifest:
    idle_info = manifest[char_name]['anims'].get('idle')
    if not idle_info:
        continue
    out_dir = os.path.join(OUT, char_name)
    idle_path = os.path.join(out_dir, f'{char_name}-idle.png')
    img = Image.open(idle_path)
    arr = np.array(img)
    cw = idle_info['cellW']
    ch = idle_info['cellH']
    frame0 = arr[:, 0:cw, :]
    alpha = frame0[:, :, 3]

    cols_with = np.any(alpha > 10, axis=0)
    rows_with = np.any(alpha > 10, axis=1)
    if not np.any(cols_with) or not np.any(rows_with):
        continue

    x_min = int(np.argmax(cols_with))
    x_max = int(cw - 1 - np.argmax(cols_with[::-1]))
    y_min = int(np.argmax(rows_with))
    y_max = int(ch - 1 - np.argmax(rows_with[::-1]))

    content_w = x_max - x_min + 1
    content_h = y_max - y_min + 1
    center_x = (x_min + x_max) // 2

    # Physics body: narrow hitbox
    body_w = max(10, content_w // 2)
    body_h = max(20, int(content_h * 0.75))
    body_off_x = max(0, center_x - body_w // 2)
    body_off_y = max(0, y_max - body_h + 1)

    manifest[char_name]['body'] = {
        'w': body_w, 'h': body_h,
        'offX': body_off_x, 'offY': body_off_y,
    }
    print(f'  {char_name}: content={content_w}x{content_h} body={body_w}x{body_h} @ ({body_off_x},{body_off_y}) cell={cw}x{ch}')

manifest_path = os.path.join(OUT, 'manifest.json')
with open(manifest_path, 'w') as f:
    json.dump(manifest, f, indent=2)
print(f'\nManifest saved to {manifest_path}')
print('Done!')
