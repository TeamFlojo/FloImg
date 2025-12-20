/**
 * v0.3.0 Filters, Effects, and Text Example
 *
 * This example demonstrates the new image transformation capabilities
 * added in v0.3.0: filters, effects, borders, text, and preset filters.
 */

import createClient from 'imgflo';

async function main() {
  const client = createClient();

  console.log('🎨 imgflo v0.3.0 - Filters, Effects, and Text Demo\n');

  // Generate a simple gradient as our base image
  console.log('1. Generating base gradient...');
  const baseImage = await client.generate({
    generator: 'shapes',
    params: {
      type: 'gradient',
      width: 800,
      height: 600,
      color1: '#667eea',
      color2: '#764ba2'
    }
  });
  await client.save(baseImage, './output/01-base-gradient.png');
  console.log('   ✓ Saved: output/01-base-gradient.png\n');

  // Apply blur filter
  console.log('2. Applying blur filter...');
  const blurred = await client.transform({
    blob: baseImage,
    op: 'blur',
    params: { sigma: 5 }
  });
  await client.save(blurred, './output/02-blurred.png');
  console.log('   ✓ Saved: output/02-blurred.png\n');

  // Apply color modulation (brightness and saturation)
  console.log('3. Modulating colors (vibrant)...');
  const vibrant = await client.transform({
    blob: baseImage,
    op: 'modulate',
    params: {
      brightness: 1.2,
      saturation: 1.5,
      hue: 30
    }
  });
  await client.save(vibrant, './output/03-vibrant.png');
  console.log('   ✓ Saved: output/03-vibrant.png\n');

  // Apply grayscale
  console.log('4. Converting to grayscale...');
  const grayscale = await client.transform({
    blob: baseImage,
    op: 'grayscale'
  });
  await client.save(grayscale, './output/04-grayscale.png');
  console.log('   ✓ Saved: output/04-grayscale.png\n');

  // Add borders
  console.log('5. Adding white border...');
  const bordered = await client.transform({
    blob: baseImage,
    op: 'extend',
    params: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
      background: '#ffffff'
    }
  });
  await client.save(bordered, './output/05-bordered.png');
  console.log('   ✓ Saved: output/05-bordered.png\n');

  // Round corners
  console.log('6. Rounding corners...');
  const rounded = await client.transform({
    blob: baseImage,
    op: 'roundCorners',
    params: { radius: 50 }
  });
  await client.save(rounded, './output/06-rounded.png');
  console.log('   ✓ Saved: output/06-rounded.png\n');

  // Add text
  console.log('7. Adding styled text...');
  const withText = await client.transform({
    blob: baseImage,
    op: 'addText',
    params: {
      text: 'imgflo v0.3.0',
      x: 400,
      y: 300,
      size: 64,
      color: '#ffffff',
      align: 'center',
      shadow: true
    }
  });
  await client.save(withText, './output/07-with-text.png');
  console.log('   ✓ Saved: output/07-with-text.png\n');

  // Add caption
  console.log('8. Adding caption bar...');
  const captioned = await client.transform({
    blob: baseImage,
    op: 'addCaption',
    params: {
      text: 'Beautiful Gradient Design',
      position: 'bottom',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#ffffff',
      fontSize: 32
    }
  });
  await client.save(captioned, './output/08-captioned.png');
  console.log('   ✓ Saved: output/08-captioned.png\n');

  // Apply preset: vintage
  console.log('9. Applying vintage preset...');
  const vintage = await client.transform({
    blob: baseImage,
    op: 'preset',
    params: { name: 'vintage' }
  });
  await client.save(vintage, './output/09-vintage.png');
  console.log('   ✓ Saved: output/09-vintage.png\n');

  // Apply preset: dramatic
  console.log('10. Applying dramatic preset...');
  const dramatic = await client.transform({
    blob: baseImage,
    op: 'preset',
    params: { name: 'dramatic' }
  });
  await client.save(dramatic, './output/10-dramatic.png');
  console.log('   ✓ Saved: output/10-dramatic.png\n');

  // Chained operations: vintage + text + caption
  console.log('11. Chaining operations (vintage + text + caption)...');
  const vintageWithText = await client.transform({
    blob: vintage,
    op: 'addText',
    params: {
      text: 'Retro Vibes',
      x: 400,
      y: 250,
      size: 72,
      color: '#ffffff',
      align: 'center',
      shadow: true,
      stroke: {
        color: '#000000',
        width: 2
      }
    }
  });

  const final = await client.transform({
    blob: vintageWithText,
    op: 'addCaption',
    params: {
      text: 'Created with imgflo v0.3.0',
      position: 'bottom'
    }
  });
  await client.save(final, './output/11-final-combined.png');
  console.log('   ✓ Saved: output/11-final-combined.png\n');

  console.log('✨ Done! Check the output/ directory for results.');
  console.log('\n📚 New in v0.3.0:');
  console.log('   • 8 filter operations (blur, sharpen, grayscale, etc.)');
  console.log('   • Border & frame operations (extend, roundCorners, extract)');
  console.log('   • Text rendering (addText, addCaption)');
  console.log('   • 8 preset filters (vintage, vibrant, dramatic, etc.)');
  console.log('   • All operations work in code, CLI, and MCP!\n');
}

main().catch(console.error);
