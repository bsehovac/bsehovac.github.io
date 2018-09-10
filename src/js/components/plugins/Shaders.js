const Shaders = ( () => {

  /**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

  THREE.FXAAShader = {

    uniforms: {

      "tDiffuse":   { value: null },
      "resolution": { value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

    },

    vertexShader: [

      "varying vec2 vUv;",

      "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

      "}"

    ].join( "\n" ),

    fragmentShader: [
          "precision highp float;",
          "",
          "uniform sampler2D tDiffuse;",
          "",
          "uniform vec2 resolution;",
          "",
          "varying vec2 vUv;",
          "",
          "// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)",
          "",
          "//----------------------------------------------------------------------------------",
          "// File:        es3-kepler\FXAA\assets\shaders/FXAA_DefaultES.frag",
          "// SDK Version: v3.00",
          "// Email:       gameworks@nvidia.com",
          "// Site:        http://developer.nvidia.com/",
          "//",
          "// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.",
          "//",
          "// Redistribution and use in source and binary forms, with or without",
          "// modification, are permitted provided that the following conditions",
          "// are met:",
          "//  * Redistributions of source code must retain the above copyright",
          "//    notice, this list of conditions and the following disclaimer.",
          "//  * Redistributions in binary form must reproduce the above copyright",
          "//    notice, this list of conditions and the following disclaimer in the",
          "//    documentation and/or other materials provided with the distribution.",
          "//  * Neither the name of NVIDIA CORPORATION nor the names of its",
          "//    contributors may be used to endorse or promote products derived",
          "//    from this software without specific prior written permission.",
          "//",
          "// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ``AS IS'' AND ANY",
          "// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE",
          "// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR",
          "// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR",
          "// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,",
          "// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,",
          "// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR",
          "// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY",
          "// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT",
          "// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE",
          "// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.",
          "//",
          "//----------------------------------------------------------------------------------",
          "",
          "#define FXAA_PC 1",
          "#define FXAA_GLSL_100 1",
          "#define FXAA_QUALITY_PRESET 12",
          "",
          "#define FXAA_GREEN_AS_LUMA 1",
          "",
          "/*--------------------------------------------------------------------------*/",
          "#ifndef FXAA_PC_CONSOLE",
          "    //",
          "    // The console algorithm for PC is included",
          "    // for developers targeting really low spec machines.",
          "    // Likely better to just run FXAA_PC, and use a really low preset.",
          "    //",
          "    #define FXAA_PC_CONSOLE 0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#ifndef FXAA_GLSL_120",
          "    #define FXAA_GLSL_120 0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#ifndef FXAA_GLSL_130",
          "    #define FXAA_GLSL_130 0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#ifndef FXAA_HLSL_3",
          "    #define FXAA_HLSL_3 0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#ifndef FXAA_HLSL_4",
          "    #define FXAA_HLSL_4 0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#ifndef FXAA_HLSL_5",
          "    #define FXAA_HLSL_5 0",
          "#endif",
          "/*==========================================================================*/",
          "#ifndef FXAA_GREEN_AS_LUMA",
          "    //",
          "    // For those using non-linear color,",
          "    // and either not able to get luma in alpha, or not wanting to,",
          "    // this enables FXAA to run using green as a proxy for luma.",
          "    // So with this enabled, no need to pack luma in alpha.",
          "    //",
          "    // This will turn off AA on anything which lacks some amount of green.",
          "    // Pure red and blue or combination of only R and B, will get no AA.",
          "    //",
          "    // Might want to lower the settings for both,",
          "    //    fxaaConsoleEdgeThresholdMin",
          "    //    fxaaQualityEdgeThresholdMin",
          "    // In order to insure AA does not get turned off on colors",
          "    // which contain a minor amount of green.",
          "    //",
          "    // 1 = On.",
          "    // 0 = Off.",
          "    //",
          "    #define FXAA_GREEN_AS_LUMA 0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#ifndef FXAA_EARLY_EXIT",
          "    //",
          "    // Controls algorithm's early exit path.",
          "    // On PS3 turning this ON adds 2 cycles to the shader.",
          "    // On 360 turning this OFF adds 10ths of a millisecond to the shader.",
          "    // Turning this off on console will result in a more blurry image.",
          "    // So this defaults to on.",
          "    //",
          "    // 1 = On.",
          "    // 0 = Off.",
          "    //",
          "    #define FXAA_EARLY_EXIT 1",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#ifndef FXAA_DISCARD",
          "    //",
          "    // Only valid for PC OpenGL currently.",
          "    // Probably will not work when FXAA_GREEN_AS_LUMA = 1.",
          "    //",
          "    // 1 = Use discard on pixels which don't need AA.",
          "    //     For APIs which enable concurrent TEX+ROP from same surface.",
          "    // 0 = Return unchanged color on pixels which don't need AA.",
          "    //",
          "    #define FXAA_DISCARD 0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#ifndef FXAA_FAST_PIXEL_OFFSET",
          "    //",
          "    // Used for GLSL 120 only.",
          "    //",
          "    // 1 = GL API supports fast pixel offsets",
          "    // 0 = do not use fast pixel offsets",
          "    //",
          "    #ifdef GL_EXT_gpu_shader4",
          "        #define FXAA_FAST_PIXEL_OFFSET 1",
          "    #endif",
          "    #ifdef GL_NV_gpu_shader5",
          "        #define FXAA_FAST_PIXEL_OFFSET 1",
          "    #endif",
          "    #ifdef GL_ARB_gpu_shader5",
          "        #define FXAA_FAST_PIXEL_OFFSET 1",
          "    #endif",
          "    #ifndef FXAA_FAST_PIXEL_OFFSET",
          "        #define FXAA_FAST_PIXEL_OFFSET 0",
          "    #endif",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#ifndef FXAA_GATHER4_ALPHA",
          "    //",
          "    // 1 = API supports gather4 on alpha channel.",
          "    // 0 = API does not support gather4 on alpha channel.",
          "    //",
          "    #if (FXAA_HLSL_5 == 1)",
          "        #define FXAA_GATHER4_ALPHA 1",
          "    #endif",
          "    #ifdef GL_ARB_gpu_shader5",
          "        #define FXAA_GATHER4_ALPHA 1",
          "    #endif",
          "    #ifdef GL_NV_gpu_shader5",
          "        #define FXAA_GATHER4_ALPHA 1",
          "    #endif",
          "    #ifndef FXAA_GATHER4_ALPHA",
          "        #define FXAA_GATHER4_ALPHA 0",
          "    #endif",
          "#endif",
          "",
          "",
          "/*============================================================================",
          "                        FXAA QUALITY - TUNING KNOBS",
          "------------------------------------------------------------------------------",
          "NOTE the other tuning knobs are now in the shader function inputs!",
          "============================================================================*/",
          "#ifndef FXAA_QUALITY_PRESET",
          "    //",
          "    // Choose the quality preset.",
          "    // This needs to be compiled into the shader as it effects code.",
          "    // Best option to include multiple presets is to",
          "    // in each shader define the preset, then include this file.",
          "    //",
          "    // OPTIONS",
          "    // -----------------------------------------------------------------------",
          "    // 10 to 15 - default medium dither (10=fastest, 15=highest quality)",
          "    // 20 to 29 - less dither, more expensive (20=fastest, 29=highest quality)",
          "    // 39       - no dither, very expensive",
          "    //",
          "    // NOTES",
          "    // -----------------------------------------------------------------------",
          "    // 12 = slightly faster then FXAA 3.9 and higher edge quality (default)",
          "    // 13 = about same speed as FXAA 3.9 and better than 12",
          "    // 23 = closest to FXAA 3.9 visually and performance wise",
          "    //  _ = the lowest digit is directly related to performance",
          "    // _  = the highest digit is directly related to style",
          "    //",
          "    #define FXAA_QUALITY_PRESET 12",
          "#endif",
          "",
          "",
          "/*============================================================================",
          "",
          "                           FXAA QUALITY - PRESETS",
          "",
          "============================================================================*/",
          "",
          "/*============================================================================",
          "                     FXAA QUALITY - MEDIUM DITHER PRESETS",
          "============================================================================*/",
          "#if (FXAA_QUALITY_PRESET == 10)",
          "    #define FXAA_QUALITY_PS 3",
          "    #define FXAA_QUALITY_P0 1.5",
          "    #define FXAA_QUALITY_P1 3.0",
          "    #define FXAA_QUALITY_P2 12.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 11)",
          "    #define FXAA_QUALITY_PS 4",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 3.0",
          "    #define FXAA_QUALITY_P3 12.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 12)",
          "    #define FXAA_QUALITY_PS 5",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 4.0",
          "    #define FXAA_QUALITY_P4 12.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 13)",
          "    #define FXAA_QUALITY_PS 6",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 4.0",
          "    #define FXAA_QUALITY_P5 12.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 14)",
          "    #define FXAA_QUALITY_PS 7",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 2.0",
          "    #define FXAA_QUALITY_P5 4.0",
          "    #define FXAA_QUALITY_P6 12.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 15)",
          "    #define FXAA_QUALITY_PS 8",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 2.0",
          "    #define FXAA_QUALITY_P5 2.0",
          "    #define FXAA_QUALITY_P6 4.0",
          "    #define FXAA_QUALITY_P7 12.0",
          "#endif",
          "",
          "/*============================================================================",
          "                     FXAA QUALITY - LOW DITHER PRESETS",
          "============================================================================*/",
          "#if (FXAA_QUALITY_PRESET == 20)",
          "    #define FXAA_QUALITY_PS 3",
          "    #define FXAA_QUALITY_P0 1.5",
          "    #define FXAA_QUALITY_P1 2.0",
          "    #define FXAA_QUALITY_P2 8.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 21)",
          "    #define FXAA_QUALITY_PS 4",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 8.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 22)",
          "    #define FXAA_QUALITY_PS 5",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 8.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 23)",
          "    #define FXAA_QUALITY_PS 6",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 2.0",
          "    #define FXAA_QUALITY_P5 8.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 24)",
          "    #define FXAA_QUALITY_PS 7",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 2.0",
          "    #define FXAA_QUALITY_P5 3.0",
          "    #define FXAA_QUALITY_P6 8.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 25)",
          "    #define FXAA_QUALITY_PS 8",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 2.0",
          "    #define FXAA_QUALITY_P5 2.0",
          "    #define FXAA_QUALITY_P6 4.0",
          "    #define FXAA_QUALITY_P7 8.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 26)",
          "    #define FXAA_QUALITY_PS 9",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 2.0",
          "    #define FXAA_QUALITY_P5 2.0",
          "    #define FXAA_QUALITY_P6 2.0",
          "    #define FXAA_QUALITY_P7 4.0",
          "    #define FXAA_QUALITY_P8 8.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 27)",
          "    #define FXAA_QUALITY_PS 10",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 2.0",
          "    #define FXAA_QUALITY_P5 2.0",
          "    #define FXAA_QUALITY_P6 2.0",
          "    #define FXAA_QUALITY_P7 2.0",
          "    #define FXAA_QUALITY_P8 4.0",
          "    #define FXAA_QUALITY_P9 8.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 28)",
          "    #define FXAA_QUALITY_PS 11",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 2.0",
          "    #define FXAA_QUALITY_P5 2.0",
          "    #define FXAA_QUALITY_P6 2.0",
          "    #define FXAA_QUALITY_P7 2.0",
          "    #define FXAA_QUALITY_P8 2.0",
          "    #define FXAA_QUALITY_P9 4.0",
          "    #define FXAA_QUALITY_P10 8.0",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_QUALITY_PRESET == 29)",
          "    #define FXAA_QUALITY_PS 12",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.5",
          "    #define FXAA_QUALITY_P2 2.0",
          "    #define FXAA_QUALITY_P3 2.0",
          "    #define FXAA_QUALITY_P4 2.0",
          "    #define FXAA_QUALITY_P5 2.0",
          "    #define FXAA_QUALITY_P6 2.0",
          "    #define FXAA_QUALITY_P7 2.0",
          "    #define FXAA_QUALITY_P8 2.0",
          "    #define FXAA_QUALITY_P9 2.0",
          "    #define FXAA_QUALITY_P10 4.0",
          "    #define FXAA_QUALITY_P11 8.0",
          "#endif",
          "",
          "/*============================================================================",
          "                     FXAA QUALITY - EXTREME QUALITY",
          "============================================================================*/",
          "#if (FXAA_QUALITY_PRESET == 39)",
          "    #define FXAA_QUALITY_PS 12",
          "    #define FXAA_QUALITY_P0 1.0",
          "    #define FXAA_QUALITY_P1 1.0",
          "    #define FXAA_QUALITY_P2 1.0",
          "    #define FXAA_QUALITY_P3 1.0",
          "    #define FXAA_QUALITY_P4 1.0",
          "    #define FXAA_QUALITY_P5 1.5",
          "    #define FXAA_QUALITY_P6 2.0",
          "    #define FXAA_QUALITY_P7 2.0",
          "    #define FXAA_QUALITY_P8 2.0",
          "    #define FXAA_QUALITY_P9 2.0",
          "    #define FXAA_QUALITY_P10 4.0",
          "    #define FXAA_QUALITY_P11 8.0",
          "#endif",
          "",
          "",
          "",
          "/*============================================================================",
          "",
          "                                API PORTING",
          "",
          "============================================================================*/",
          "#if (FXAA_GLSL_100 == 1) || (FXAA_GLSL_120 == 1) || (FXAA_GLSL_130 == 1)",
          "    #define FxaaBool bool",
          "    #define FxaaDiscard discard",
          "    #define FxaaFloat float",
          "    #define FxaaFloat2 vec2",
          "    #define FxaaFloat3 vec3",
          "    #define FxaaFloat4 vec4",
          "    #define FxaaHalf float",
          "    #define FxaaHalf2 vec2",
          "    #define FxaaHalf3 vec3",
          "    #define FxaaHalf4 vec4",
          "    #define FxaaInt2 ivec2",
          "    #define FxaaSat(x) clamp(x, 0.0, 1.0)",
          "    #define FxaaTex sampler2D",
          "#else",
          "    #define FxaaBool bool",
          "    #define FxaaDiscard clip(-1)",
          "    #define FxaaFloat float",
          "    #define FxaaFloat2 float2",
          "    #define FxaaFloat3 float3",
          "    #define FxaaFloat4 float4",
          "    #define FxaaHalf half",
          "    #define FxaaHalf2 half2",
          "    #define FxaaHalf3 half3",
          "    #define FxaaHalf4 half4",
          "    #define FxaaSat(x) saturate(x)",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_GLSL_100 == 1)",
          "  #define FxaaTexTop(t, p) texture2D(t, p, 0.0)",
          "  #define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), 0.0)",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_GLSL_120 == 1)",
          "    // Requires,",
          "    //  #version 120",
          "    // And at least,",
          "    //  #extension GL_EXT_gpu_shader4 : enable",
          "    //  (or set FXAA_FAST_PIXEL_OFFSET 1 to work like DX9)",
          "    #define FxaaTexTop(t, p) texture2DLod(t, p, 0.0)",
          "    #if (FXAA_FAST_PIXEL_OFFSET == 1)",
          "        #define FxaaTexOff(t, p, o, r) texture2DLodOffset(t, p, 0.0, o)",
          "    #else",
          "        #define FxaaTexOff(t, p, o, r) texture2DLod(t, p + (o * r), 0.0)",
          "    #endif",
          "    #if (FXAA_GATHER4_ALPHA == 1)",
          "        // use #extension GL_ARB_gpu_shader5 : enable",
          "        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)",
          "        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)",
          "        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)",
          "        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)",
          "    #endif",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_GLSL_130 == 1)",
          "    // Requires \"#version 130\" or better",
          "    #define FxaaTexTop(t, p) textureLod(t, p, 0.0)",
          "    #define FxaaTexOff(t, p, o, r) textureLodOffset(t, p, 0.0, o)",
          "    #if (FXAA_GATHER4_ALPHA == 1)",
          "        // use #extension GL_ARB_gpu_shader5 : enable",
          "        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)",
          "        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)",
          "        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)",
          "        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)",
          "    #endif",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_HLSL_3 == 1)",
          "    #define FxaaInt2 float2",
          "    #define FxaaTex sampler2D",
          "    #define FxaaTexTop(t, p) tex2Dlod(t, float4(p, 0.0, 0.0))",
          "    #define FxaaTexOff(t, p, o, r) tex2Dlod(t, float4(p + (o * r), 0, 0))",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_HLSL_4 == 1)",
          "    #define FxaaInt2 int2",
          "    struct FxaaTex { SamplerState smpl; Texture2D tex; };",
          "    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)",
          "    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)",
          "#endif",
          "/*--------------------------------------------------------------------------*/",
          "#if (FXAA_HLSL_5 == 1)",
          "    #define FxaaInt2 int2",
          "    struct FxaaTex { SamplerState smpl; Texture2D tex; };",
          "    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)",
          "    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)",
          "    #define FxaaTexAlpha4(t, p) t.tex.GatherAlpha(t.smpl, p)",
          "    #define FxaaTexOffAlpha4(t, p, o) t.tex.GatherAlpha(t.smpl, p, o)",
          "    #define FxaaTexGreen4(t, p) t.tex.GatherGreen(t.smpl, p)",
          "    #define FxaaTexOffGreen4(t, p, o) t.tex.GatherGreen(t.smpl, p, o)",
          "#endif",
          "",
          "",
          "/*============================================================================",
          "                   GREEN AS LUMA OPTION SUPPORT FUNCTION",
          "============================================================================*/",
          "#if (FXAA_GREEN_AS_LUMA == 0)",
          "    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.w; }",
          "#else",
          "    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.y; }",
          "#endif",
          "",
          "",
          "",
          "",
          "/*============================================================================",
          "",
          "                             FXAA3 QUALITY - PC",
          "",
          "============================================================================*/",
          "#if (FXAA_PC == 1)",
          "/*--------------------------------------------------------------------------*/",
          "FxaaFloat4 FxaaPixelShader(",
          "    //",
          "    // Use noperspective interpolation here (turn off perspective interpolation).",
          "    // {xy} = center of pixel",
          "    FxaaFloat2 pos,",
          "    //",
          "    // Used only for FXAA Console, and not used on the 360 version.",
          "    // Use noperspective interpolation here (turn off perspective interpolation).",
          "    // {xy_} = upper left of pixel",
          "    // {_zw} = lower right of pixel",
          "    FxaaFloat4 fxaaConsolePosPos,",
          "    //",
          "    // Input color texture.",
          "    // {rgb_} = color in linear or perceptual color space",
          "    // if (FXAA_GREEN_AS_LUMA == 0)",
          "    //     {__a} = luma in perceptual color space (not linear)",
          "    FxaaTex tex,",
          "    //",
          "    // Only used on the optimized 360 version of FXAA Console.",
          "    // For everything but 360, just use the same input here as for \"tex\".",
          "    // For 360, same texture, just alias with a 2nd sampler.",
          "    // This sampler needs to have an exponent bias of -1.",
          "    FxaaTex fxaaConsole360TexExpBiasNegOne,",
          "    //",
          "    // Only used on the optimized 360 version of FXAA Console.",
          "    // For everything but 360, just use the same input here as for \"tex\".",
          "    // For 360, same texture, just alias with a 3nd sampler.",
          "    // This sampler needs to have an exponent bias of -2.",
          "    FxaaTex fxaaConsole360TexExpBiasNegTwo,",
          "    //",
          "    // Only used on FXAA Quality.",
          "    // This must be from a constant/uniform.",
          "    // {x_} = 1.0/screenWidthInPixels",
          "    // {_y} = 1.0/screenHeightInPixels",
          "    FxaaFloat2 fxaaQualityRcpFrame,",
          "    //",
          "    // Only used on FXAA Console.",
          "    // This must be from a constant/uniform.",
          "    // This effects sub-pixel AA quality and inversely sharpness.",
          "    //   Where N ranges between,",
          "    //     N = 0.50 (default)",
          "    //     N = 0.33 (sharper)",
          "    // {x__} = -N/screenWidthInPixels",
          "    // {_y_} = -N/screenHeightInPixels",
          "    // {_z_} =  N/screenWidthInPixels",
          "    // {__w} =  N/screenHeightInPixels",
          "    FxaaFloat4 fxaaConsoleRcpFrameOpt,",
          "    //",
          "    // Only used on FXAA Console.",
          "    // Not used on 360, but used on PS3 and PC.",
          "    // This must be from a constant/uniform.",
          "    // {x__} = -2.0/screenWidthInPixels",
          "    // {_y_} = -2.0/screenHeightInPixels",
          "    // {_z_} =  2.0/screenWidthInPixels",
          "    // {__w} =  2.0/screenHeightInPixels",
          "    FxaaFloat4 fxaaConsoleRcpFrameOpt2,",
          "    //",
          "    // Only used on FXAA Console.",
          "    // Only used on 360 in place of fxaaConsoleRcpFrameOpt2.",
          "    // This must be from a constant/uniform.",
          "    // {x__} =  8.0/screenWidthInPixels",
          "    // {_y_} =  8.0/screenHeightInPixels",
          "    // {_z_} = -4.0/screenWidthInPixels",
          "    // {__w} = -4.0/screenHeightInPixels",
          "    FxaaFloat4 fxaaConsole360RcpFrameOpt2,",
          "    //",
          "    // Only used on FXAA Quality.",
          "    // This used to be the FXAA_QUALITY_SUBPIX define.",
          "    // It is here now to allow easier tuning.",
          "    // Choose the amount of sub-pixel aliasing removal.",
          "    // This can effect sharpness.",
          "    //   1.00 - upper limit (softer)",
          "    //   0.75 - default amount of filtering",
          "    //   0.50 - lower limit (sharper, less sub-pixel aliasing removal)",
          "    //   0.25 - almost off",
          "    //   0.00 - completely off",
          "    FxaaFloat fxaaQualitySubpix,",
          "    //",
          "    // Only used on FXAA Quality.",
          "    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD define.",
          "    // It is here now to allow easier tuning.",
          "    // The minimum amount of local contrast required to apply algorithm.",
          "    //   0.333 - too little (faster)",
          "    //   0.250 - low quality",
          "    //   0.166 - default",
          "    //   0.125 - high quality",
          "    //   0.063 - overkill (slower)",
          "    FxaaFloat fxaaQualityEdgeThreshold,",
          "    //",
          "    // Only used on FXAA Quality.",
          "    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD_MIN define.",
          "    // It is here now to allow easier tuning.",
          "    // Trims the algorithm from processing darks.",
          "    //   0.0833 - upper limit (default, the start of visible unfiltered edges)",
          "    //   0.0625 - high quality (faster)",
          "    //   0.0312 - visible limit (slower)",
          "    // Special notes when using FXAA_GREEN_AS_LUMA,",
          "    //   Likely want to set this to zero.",
          "    //   As colors that are mostly not-green",
          "    //   will appear very dark in the green channel!",
          "    //   Tune by looking at mostly non-green content,",
          "    //   then start at zero and increase until aliasing is a problem.",
          "    FxaaFloat fxaaQualityEdgeThresholdMin,",
          "    //",
          "    // Only used on FXAA Console.",
          "    // This used to be the FXAA_CONSOLE_EDGE_SHARPNESS define.",
          "    // It is here now to allow easier tuning.",
          "    // This does not effect PS3, as this needs to be compiled in.",
          "    //   Use FXAA_CONSOLE_PS3_EDGE_SHARPNESS for PS3.",
          "    //   Due to the PS3 being ALU bound,",
          "    //   there are only three safe values here: 2 and 4 and 8.",
          "    //   These options use the shaders ability to a free *|/ by 2|4|8.",
          "    // For all other platforms can be a non-power of two.",
          "    //   8.0 is sharper (default!!!)",
          "    //   4.0 is softer",
          "    //   2.0 is really soft (good only for vector graphics inputs)",
          "    FxaaFloat fxaaConsoleEdgeSharpness,",
          "    //",
          "    // Only used on FXAA Console.",
          "    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD define.",
          "    // It is here now to allow easier tuning.",
          "    // This does not effect PS3, as this needs to be compiled in.",
          "    //   Use FXAA_CONSOLE_PS3_EDGE_THRESHOLD for PS3.",
          "    //   Due to the PS3 being ALU bound,",
          "    //   there are only two safe values here: 1/4 and 1/8.",
          "    //   These options use the shaders ability to a free *|/ by 2|4|8.",
          "    // The console setting has a different mapping than the quality setting.",
          "    // Other platforms can use other values.",
          "    //   0.125 leaves less aliasing, but is softer (default!!!)",
          "    //   0.25 leaves more aliasing, and is sharper",
          "    FxaaFloat fxaaConsoleEdgeThreshold,",
          "    //",
          "    // Only used on FXAA Console.",
          "    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD_MIN define.",
          "    // It is here now to allow easier tuning.",
          "    // Trims the algorithm from processing darks.",
          "    // The console setting has a different mapping than the quality setting.",
          "    // This only applies when FXAA_EARLY_EXIT is 1.",
          "    // This does not apply to PS3,",
          "    // PS3 was simplified to avoid more shader instructions.",
          "    //   0.06 - faster but more aliasing in darks",
          "    //   0.05 - default",
          "    //   0.04 - slower and less aliasing in darks",
          "    // Special notes when using FXAA_GREEN_AS_LUMA,",
          "    //   Likely want to set this to zero.",
          "    //   As colors that are mostly not-green",
          "    //   will appear very dark in the green channel!",
          "    //   Tune by looking at mostly non-green content,",
          "    //   then start at zero and increase until aliasing is a problem.",
          "    FxaaFloat fxaaConsoleEdgeThresholdMin,",
          "    //",
          "    // Extra constants for 360 FXAA Console only.",
          "    // Use zeros or anything else for other platforms.",
          "    // These must be in physical constant registers and NOT immediates.",
          "    // Immediates will result in compiler un-optimizing.",
          "    // {xyzw} = float4(1.0, -1.0, 0.25, -0.25)",
          "    FxaaFloat4 fxaaConsole360ConstDir",
          ") {",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat2 posM;",
          "    posM.x = pos.x;",
          "    posM.y = pos.y;",
          "    #if (FXAA_GATHER4_ALPHA == 1)",
          "        #if (FXAA_DISCARD == 0)",
          "            FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);",
          "            #if (FXAA_GREEN_AS_LUMA == 0)",
          "                #define lumaM rgbyM.w",
          "            #else",
          "                #define lumaM rgbyM.y",
          "            #endif",
          "        #endif",
          "        #if (FXAA_GREEN_AS_LUMA == 0)",
          "            FxaaFloat4 luma4A = FxaaTexAlpha4(tex, posM);",
          "            FxaaFloat4 luma4B = FxaaTexOffAlpha4(tex, posM, FxaaInt2(-1, -1));",
          "        #else",
          "            FxaaFloat4 luma4A = FxaaTexGreen4(tex, posM);",
          "            FxaaFloat4 luma4B = FxaaTexOffGreen4(tex, posM, FxaaInt2(-1, -1));",
          "        #endif",
          "        #if (FXAA_DISCARD == 1)",
          "            #define lumaM luma4A.w",
          "        #endif",
          "        #define lumaE luma4A.z",
          "        #define lumaS luma4A.x",
          "        #define lumaSE luma4A.y",
          "        #define lumaNW luma4B.w",
          "        #define lumaN luma4B.z",
          "        #define lumaW luma4B.x",
          "    #else",
          "        FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);",
          "        #if (FXAA_GREEN_AS_LUMA == 0)",
          "            #define lumaM rgbyM.w",
          "        #else",
          "            #define lumaM rgbyM.y",
          "        #endif",
          "        #if (FXAA_GLSL_100 == 1)",
          "          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0, 1.0), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 0.0), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0,-1.0), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 0.0), fxaaQualityRcpFrame.xy));",
          "        #else",
          "          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0, 1), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 0), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0,-1), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 0), fxaaQualityRcpFrame.xy));",
          "        #endif",
          "    #endif",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat maxSM = max(lumaS, lumaM);",
          "    FxaaFloat minSM = min(lumaS, lumaM);",
          "    FxaaFloat maxESM = max(lumaE, maxSM);",
          "    FxaaFloat minESM = min(lumaE, minSM);",
          "    FxaaFloat maxWN = max(lumaN, lumaW);",
          "    FxaaFloat minWN = min(lumaN, lumaW);",
          "    FxaaFloat rangeMax = max(maxWN, maxESM);",
          "    FxaaFloat rangeMin = min(minWN, minESM);",
          "    FxaaFloat rangeMaxScaled = rangeMax * fxaaQualityEdgeThreshold;",
          "    FxaaFloat range = rangeMax - rangeMin;",
          "    FxaaFloat rangeMaxClamped = max(fxaaQualityEdgeThresholdMin, rangeMaxScaled);",
          "    FxaaBool earlyExit = range < rangeMaxClamped;",
          "/*--------------------------------------------------------------------------*/",
          "    if(earlyExit)",
          "        #if (FXAA_DISCARD == 1)",
          "            FxaaDiscard;",
          "        #else",
          "            return rgbyM;",
          "        #endif",
          "/*--------------------------------------------------------------------------*/",
          "    #if (FXAA_GATHER4_ALPHA == 0)",
          "        #if (FXAA_GLSL_100 == 1)",
          "          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0,-1.0), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 1.0), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0,-1.0), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 1.0), fxaaQualityRcpFrame.xy));",
          "        #else",
          "          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1,-1), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 1), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1,-1), fxaaQualityRcpFrame.xy));",
          "          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));",
          "        #endif",
          "    #else",
          "        FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(1, -1), fxaaQualityRcpFrame.xy));",
          "        FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));",
          "    #endif",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat lumaNS = lumaN + lumaS;",
          "    FxaaFloat lumaWE = lumaW + lumaE;",
          "    FxaaFloat subpixRcpRange = 1.0/range;",
          "    FxaaFloat subpixNSWE = lumaNS + lumaWE;",
          "    FxaaFloat edgeHorz1 = (-2.0 * lumaM) + lumaNS;",
          "    FxaaFloat edgeVert1 = (-2.0 * lumaM) + lumaWE;",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat lumaNESE = lumaNE + lumaSE;",
          "    FxaaFloat lumaNWNE = lumaNW + lumaNE;",
          "    FxaaFloat edgeHorz2 = (-2.0 * lumaE) + lumaNESE;",
          "    FxaaFloat edgeVert2 = (-2.0 * lumaN) + lumaNWNE;",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat lumaNWSW = lumaNW + lumaSW;",
          "    FxaaFloat lumaSWSE = lumaSW + lumaSE;",
          "    FxaaFloat edgeHorz4 = (abs(edgeHorz1) * 2.0) + abs(edgeHorz2);",
          "    FxaaFloat edgeVert4 = (abs(edgeVert1) * 2.0) + abs(edgeVert2);",
          "    FxaaFloat edgeHorz3 = (-2.0 * lumaW) + lumaNWSW;",
          "    FxaaFloat edgeVert3 = (-2.0 * lumaS) + lumaSWSE;",
          "    FxaaFloat edgeHorz = abs(edgeHorz3) + edgeHorz4;",
          "    FxaaFloat edgeVert = abs(edgeVert3) + edgeVert4;",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat subpixNWSWNESE = lumaNWSW + lumaNESE;",
          "    FxaaFloat lengthSign = fxaaQualityRcpFrame.x;",
          "    FxaaBool horzSpan = edgeHorz >= edgeVert;",
          "    FxaaFloat subpixA = subpixNSWE * 2.0 + subpixNWSWNESE;",
          "/*--------------------------------------------------------------------------*/",
          "    if(!horzSpan) lumaN = lumaW;",
          "    if(!horzSpan) lumaS = lumaE;",
          "    if(horzSpan) lengthSign = fxaaQualityRcpFrame.y;",
          "    FxaaFloat subpixB = (subpixA * (1.0/12.0)) - lumaM;",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat gradientN = lumaN - lumaM;",
          "    FxaaFloat gradientS = lumaS - lumaM;",
          "    FxaaFloat lumaNN = lumaN + lumaM;",
          "    FxaaFloat lumaSS = lumaS + lumaM;",
          "    FxaaBool pairN = abs(gradientN) >= abs(gradientS);",
          "    FxaaFloat gradient = max(abs(gradientN), abs(gradientS));",
          "    if(pairN) lengthSign = -lengthSign;",
          "    FxaaFloat subpixC = FxaaSat(abs(subpixB) * subpixRcpRange);",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat2 posB;",
          "    posB.x = posM.x;",
          "    posB.y = posM.y;",
          "    FxaaFloat2 offNP;",
          "    offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;",
          "    offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;",
          "    if(!horzSpan) posB.x += lengthSign * 0.5;",
          "    if( horzSpan) posB.y += lengthSign * 0.5;",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat2 posN;",
          "    posN.x = posB.x - offNP.x * FXAA_QUALITY_P0;",
          "    posN.y = posB.y - offNP.y * FXAA_QUALITY_P0;",
          "    FxaaFloat2 posP;",
          "    posP.x = posB.x + offNP.x * FXAA_QUALITY_P0;",
          "    posP.y = posB.y + offNP.y * FXAA_QUALITY_P0;",
          "    FxaaFloat subpixD = ((-2.0)*subpixC) + 3.0;",
          "    FxaaFloat lumaEndN = FxaaLuma(FxaaTexTop(tex, posN));",
          "    FxaaFloat subpixE = subpixC * subpixC;",
          "    FxaaFloat lumaEndP = FxaaLuma(FxaaTexTop(tex, posP));",
          "/*--------------------------------------------------------------------------*/",
          "    if(!pairN) lumaNN = lumaSS;",
          "    FxaaFloat gradientScaled = gradient * 1.0/4.0;",
          "    FxaaFloat lumaMM = lumaM - lumaNN * 0.5;",
          "    FxaaFloat subpixF = subpixD * subpixE;",
          "    FxaaBool lumaMLTZero = lumaMM < 0.0;",
          "/*--------------------------------------------------------------------------*/",
          "    lumaEndN -= lumaNN * 0.5;",
          "    lumaEndP -= lumaNN * 0.5;",
          "    FxaaBool doneN = abs(lumaEndN) >= gradientScaled;",
          "    FxaaBool doneP = abs(lumaEndP) >= gradientScaled;",
          "    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P1;",
          "    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P1;",
          "    FxaaBool doneNP = (!doneN) || (!doneP);",
          "    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P1;",
          "    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P1;",
          "/*--------------------------------------------------------------------------*/",
          "    if(doneNP) {",
          "        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "        doneN = abs(lumaEndN) >= gradientScaled;",
          "        doneP = abs(lumaEndP) >= gradientScaled;",
          "        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P2;",
          "        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P2;",
          "        doneNP = (!doneN) || (!doneP);",
          "        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P2;",
          "        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P2;",
          "/*--------------------------------------------------------------------------*/",
          "        #if (FXAA_QUALITY_PS > 3)",
          "        if(doneNP) {",
          "            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "            doneN = abs(lumaEndN) >= gradientScaled;",
          "            doneP = abs(lumaEndP) >= gradientScaled;",
          "            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P3;",
          "            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P3;",
          "            doneNP = (!doneN) || (!doneP);",
          "            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P3;",
          "            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P3;",
          "/*--------------------------------------------------------------------------*/",
          "            #if (FXAA_QUALITY_PS > 4)",
          "            if(doneNP) {",
          "                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "                doneN = abs(lumaEndN) >= gradientScaled;",
          "                doneP = abs(lumaEndP) >= gradientScaled;",
          "                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P4;",
          "                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P4;",
          "                doneNP = (!doneN) || (!doneP);",
          "                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P4;",
          "                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P4;",
          "/*--------------------------------------------------------------------------*/",
          "                #if (FXAA_QUALITY_PS > 5)",
          "                if(doneNP) {",
          "                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "                    doneN = abs(lumaEndN) >= gradientScaled;",
          "                    doneP = abs(lumaEndP) >= gradientScaled;",
          "                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P5;",
          "                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P5;",
          "                    doneNP = (!doneN) || (!doneP);",
          "                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P5;",
          "                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P5;",
          "/*--------------------------------------------------------------------------*/",
          "                    #if (FXAA_QUALITY_PS > 6)",
          "                    if(doneNP) {",
          "                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "                        doneN = abs(lumaEndN) >= gradientScaled;",
          "                        doneP = abs(lumaEndP) >= gradientScaled;",
          "                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P6;",
          "                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P6;",
          "                        doneNP = (!doneN) || (!doneP);",
          "                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P6;",
          "                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P6;",
          "/*--------------------------------------------------------------------------*/",
          "                        #if (FXAA_QUALITY_PS > 7)",
          "                        if(doneNP) {",
          "                            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "                            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "                            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "                            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "                            doneN = abs(lumaEndN) >= gradientScaled;",
          "                            doneP = abs(lumaEndP) >= gradientScaled;",
          "                            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P7;",
          "                            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P7;",
          "                            doneNP = (!doneN) || (!doneP);",
          "                            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P7;",
          "                            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P7;",
          "/*--------------------------------------------------------------------------*/",
          "    #if (FXAA_QUALITY_PS > 8)",
          "    if(doneNP) {",
          "        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "        doneN = abs(lumaEndN) >= gradientScaled;",
          "        doneP = abs(lumaEndP) >= gradientScaled;",
          "        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P8;",
          "        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P8;",
          "        doneNP = (!doneN) || (!doneP);",
          "        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P8;",
          "        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P8;",
          "/*--------------------------------------------------------------------------*/",
          "        #if (FXAA_QUALITY_PS > 9)",
          "        if(doneNP) {",
          "            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "            doneN = abs(lumaEndN) >= gradientScaled;",
          "            doneP = abs(lumaEndP) >= gradientScaled;",
          "            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P9;",
          "            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P9;",
          "            doneNP = (!doneN) || (!doneP);",
          "            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P9;",
          "            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P9;",
          "/*--------------------------------------------------------------------------*/",
          "            #if (FXAA_QUALITY_PS > 10)",
          "            if(doneNP) {",
          "                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "                doneN = abs(lumaEndN) >= gradientScaled;",
          "                doneP = abs(lumaEndP) >= gradientScaled;",
          "                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P10;",
          "                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P10;",
          "                doneNP = (!doneN) || (!doneP);",
          "                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P10;",
          "                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P10;",
          "/*--------------------------------------------------------------------------*/",
          "                #if (FXAA_QUALITY_PS > 11)",
          "                if(doneNP) {",
          "                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "                    doneN = abs(lumaEndN) >= gradientScaled;",
          "                    doneP = abs(lumaEndP) >= gradientScaled;",
          "                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P11;",
          "                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P11;",
          "                    doneNP = (!doneN) || (!doneP);",
          "                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P11;",
          "                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P11;",
          "/*--------------------------------------------------------------------------*/",
          "                    #if (FXAA_QUALITY_PS > 12)",
          "                    if(doneNP) {",
          "                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
          "                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
          "                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
          "                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
          "                        doneN = abs(lumaEndN) >= gradientScaled;",
          "                        doneP = abs(lumaEndP) >= gradientScaled;",
          "                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P12;",
          "                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P12;",
          "                        doneNP = (!doneN) || (!doneP);",
          "                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P12;",
          "                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P12;",
          "/*--------------------------------------------------------------------------*/",
          "                    }",
          "                    #endif",
          "/*--------------------------------------------------------------------------*/",
          "                }",
          "                #endif",
          "/*--------------------------------------------------------------------------*/",
          "            }",
          "            #endif",
          "/*--------------------------------------------------------------------------*/",
          "        }",
          "        #endif",
          "/*--------------------------------------------------------------------------*/",
          "    }",
          "    #endif",
          "/*--------------------------------------------------------------------------*/",
          "                        }",
          "                        #endif",
          "/*--------------------------------------------------------------------------*/",
          "                    }",
          "                    #endif",
          "/*--------------------------------------------------------------------------*/",
          "                }",
          "                #endif",
          "/*--------------------------------------------------------------------------*/",
          "            }",
          "            #endif",
          "/*--------------------------------------------------------------------------*/",
          "        }",
          "        #endif",
          "/*--------------------------------------------------------------------------*/",
          "    }",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat dstN = posM.x - posN.x;",
          "    FxaaFloat dstP = posP.x - posM.x;",
          "    if(!horzSpan) dstN = posM.y - posN.y;",
          "    if(!horzSpan) dstP = posP.y - posM.y;",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaBool goodSpanN = (lumaEndN < 0.0) != lumaMLTZero;",
          "    FxaaFloat spanLength = (dstP + dstN);",
          "    FxaaBool goodSpanP = (lumaEndP < 0.0) != lumaMLTZero;",
          "    FxaaFloat spanLengthRcp = 1.0/spanLength;",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaBool directionN = dstN < dstP;",
          "    FxaaFloat dst = min(dstN, dstP);",
          "    FxaaBool goodSpan = directionN ? goodSpanN : goodSpanP;",
          "    FxaaFloat subpixG = subpixF * subpixF;",
          "    FxaaFloat pixelOffset = (dst * (-spanLengthRcp)) + 0.5;",
          "    FxaaFloat subpixH = subpixG * fxaaQualitySubpix;",
          "/*--------------------------------------------------------------------------*/",
          "    FxaaFloat pixelOffsetGood = goodSpan ? pixelOffset : 0.0;",
          "    FxaaFloat pixelOffsetSubpix = max(pixelOffsetGood, subpixH);",
          "    if(!horzSpan) posM.x += pixelOffsetSubpix * lengthSign;",
          "    if( horzSpan) posM.y += pixelOffsetSubpix * lengthSign;",
          "    #if (FXAA_DISCARD == 1)",
          "        return FxaaTexTop(tex, posM);",
          "    #else",
          "        return FxaaFloat4(FxaaTexTop(tex, posM).xyz, lumaM);",
          "    #endif",
          "}",
          "/*==========================================================================*/",
          "#endif",
          "",
          "void main() {",
          "  gl_FragColor = FxaaPixelShader(",
          "    vUv,",
          "    vec4(0.0),",
          "    tDiffuse,",
          "    tDiffuse,",
          "    tDiffuse,",
          "    resolution,",
          "    vec4(0.0),",
          "    vec4(0.0),",
          "    vec4(0.0),",
          "    0.75,",
          "    0.166,",
          "    0.0833,",
          "    0.0,",
          "    0.0,",
          "    0.0,",
          "    vec4(0.0)",
          "  );",
          "",
          "  // TODO avoid querying texture twice for same texel",
          "  gl_FragColor.a = texture2D(tDiffuse, vUv).a;",
          "}"
    ].join("\n")

  };

  /**
   * @author bhouston / http://clara.io/
   *
   * Luminosity
   * http://en.wikipedia.org/wiki/Luminosity
   */

  THREE.LuminosityHighPassShader = {

    shaderID: "luminosityHighPass",

    uniforms: {

      "tDiffuse": { type: "t", value: null },
      "luminosityThreshold": { type: "f", value: 1.0 },
      "smoothWidth": { type: "f", value: 1.0 },
      "defaultColor": { type: "c", value: new THREE.Color( 0x000000 ) },
      "defaultOpacity":  { type: "f", value: 0.0 }

    },

    vertexShader: [

      "varying vec2 vUv;",

      "void main() {",

        "vUv = uv;",

        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

      "}"

    ].join("\n"),

    fragmentShader: [

      "uniform sampler2D tDiffuse;",
      "uniform vec3 defaultColor;",
      "uniform float defaultOpacity;",
      "uniform float luminosityThreshold;",
      "uniform float smoothWidth;",

      "varying vec2 vUv;",

      "void main() {",

        "vec4 texel = texture2D( tDiffuse, vUv );",

        "vec3 luma = vec3( 0.299, 0.587, 0.114 );",

        "float v = dot( texel.xyz, luma );",

        "vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );",

        "float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );",

        "gl_FragColor = mix( outputColor, texel, alpha );",

      "}"

    ].join("\n")

  };

  /**
   * @author spidersharma / http://eduperiment.com/
   *
   * Inspired from Unreal Engine
   * https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/
   */
  THREE.UnrealBloomPass = function ( resolution, strength, radius, threshold ) {

    THREE.Pass.call( this );

    this.strength = ( strength !== undefined ) ? strength : 1;
    this.radius = radius;
    this.threshold = threshold;
    this.resolution = ( resolution !== undefined ) ? new THREE.Vector2( resolution.x, resolution.y ) : new THREE.Vector2( 256, 256 );

    // create color only once here, reuse it later inside the render function
    this.clearColor = new THREE.Color( 0, 0, 0 );

    // render targets
    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;
    var resx = Math.round( this.resolution.x / 2 );
    var resy = Math.round( this.resolution.y / 2 );

    this.renderTargetBright = new THREE.WebGLRenderTarget( resx, resy, pars );
    this.renderTargetBright.texture.name = "UnrealBloomPass.bright";
    this.renderTargetBright.texture.generateMipmaps = false;

    for ( var i = 0; i < this.nMips; i ++ ) {

      var renderTarget = new THREE.WebGLRenderTarget( resx, resy, pars );

      renderTarget.texture.name = "UnrealBloomPass.h" + i;
      renderTarget.texture.generateMipmaps = false;

      this.renderTargetsHorizontal.push( renderTarget );

      var renderTarget = new THREE.WebGLRenderTarget( resx, resy, pars );

      renderTarget.texture.name = "UnrealBloomPass.v" + i;
      renderTarget.texture.generateMipmaps = false;

      this.renderTargetsVertical.push( renderTarget );

      resx = Math.round( resx / 2 );

      resy = Math.round( resy / 2 );

    }

    // luminosity high pass material

    if ( THREE.LuminosityHighPassShader === undefined )
      console.error( "THREE.UnrealBloomPass relies on THREE.LuminosityHighPassShader" );

    var highPassShader = THREE.LuminosityHighPassShader;
    this.highPassUniforms = THREE.UniformsUtils.clone( highPassShader.uniforms );

    this.highPassUniforms[ "luminosityThreshold" ].value = threshold;
    this.highPassUniforms[ "smoothWidth" ].value = 0.01;

    this.materialHighPassFilter = new THREE.ShaderMaterial( {
      uniforms: this.highPassUniforms,
      vertexShader: highPassShader.vertexShader,
      fragmentShader: highPassShader.fragmentShader,
      defines: {}
    } );

    // Gaussian Blur Materials
    this.separableBlurMaterials = [];
    var kernelSizeArray = [ 3, 5, 7, 9, 11 ];
    var resx = Math.round( this.resolution.x / 2 );
    var resy = Math.round( this.resolution.y / 2 );

    for ( var i = 0; i < this.nMips; i ++ ) {

      this.separableBlurMaterials.push( this.getSeperableBlurMaterial( kernelSizeArray[ i ] ) );

      this.separableBlurMaterials[ i ].uniforms[ "texSize" ].value = new THREE.Vector2( resx, resy );

      resx = Math.round( resx / 2 );

      resy = Math.round( resy / 2 );

    }

    // Composite material
    this.compositeMaterial = this.getCompositeMaterial( this.nMips );
    this.compositeMaterial.uniforms[ "blurTexture1" ].value = this.renderTargetsVertical[ 0 ].texture;
    this.compositeMaterial.uniforms[ "blurTexture2" ].value = this.renderTargetsVertical[ 1 ].texture;
    this.compositeMaterial.uniforms[ "blurTexture3" ].value = this.renderTargetsVertical[ 2 ].texture;
    this.compositeMaterial.uniforms[ "blurTexture4" ].value = this.renderTargetsVertical[ 3 ].texture;
    this.compositeMaterial.uniforms[ "blurTexture5" ].value = this.renderTargetsVertical[ 4 ].texture;
    this.compositeMaterial.uniforms[ "bloomStrength" ].value = strength;
    this.compositeMaterial.uniforms[ "bloomRadius" ].value = 0.1;
    this.compositeMaterial.needsUpdate = true;

    var bloomFactors = [ 1.0, 0.8, 0.6, 0.4, 0.2 ];
    this.compositeMaterial.uniforms[ "bloomFactors" ].value = bloomFactors;
    this.bloomTintColors = [ new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ),
                 new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ) ];
    this.compositeMaterial.uniforms[ "bloomTintColors" ].value = this.bloomTintColors;

    // copy material
    if ( THREE.CopyShader === undefined ) {

      console.error( "THREE.BloomPass relies on THREE.CopyShader" );

    }

    var copyShader = THREE.CopyShader;

    this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );
    this.copyUniforms[ "opacity" ].value = 1.0;

    this.materialCopy = new THREE.ShaderMaterial( {
      uniforms: this.copyUniforms,
      vertexShader: copyShader.vertexShader,
      fragmentShader: copyShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    } );

    this.enabled = true;
    this.needsSwap = false;

    this.oldClearColor = new THREE.Color();
    this.oldClearAlpha = 1;

    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene = new THREE.Scene();

    this.basic = new THREE.MeshBasicMaterial();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.quad.frustumCulled = false; // Avoid getting clipped
    this.scene.add( this.quad );

  };

  THREE.UnrealBloomPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

    constructor: THREE.UnrealBloomPass,

    dispose: function () {

      for ( var i = 0; i < this.renderTargetsHorizontal.length; i ++ ) {

        this.renderTargetsHorizontal[ i ].dispose();

      }

      for ( var i = 0; i < this.renderTargetsVertical.length; i ++ ) {

        this.renderTargetsVertical[ i ].dispose();

      }

      this.renderTargetBright.dispose();

    },

    setSize: function ( width, height ) {

      var resx = Math.round( width / 2 );
      var resy = Math.round( height / 2 );

      this.renderTargetBright.setSize( resx, resy );

      for ( var i = 0; i < this.nMips; i ++ ) {

        this.renderTargetsHorizontal[ i ].setSize( resx, resy );
        this.renderTargetsVertical[ i ].setSize( resx, resy );

        this.separableBlurMaterials[ i ].uniforms[ "texSize" ].value = new THREE.Vector2( resx, resy );

        resx = Math.round( resx / 2 );
        resy = Math.round( resy / 2 );

      }

    },

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

      this.oldClearColor.copy( renderer.getClearColor() );
      this.oldClearAlpha = renderer.getClearAlpha();
      var oldAutoClear = renderer.autoClear;
      renderer.autoClear = false;

      renderer.setClearColor( this.clearColor, 0 );

      if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

      // Render input to screen

      if ( this.renderToScreen ) {

        this.quad.material = this.basic;
        this.basic.map = readBuffer.texture;

        renderer.render( this.scene, this.camera, undefined, true );

      }

      // 1. Extract Bright Areas

      this.highPassUniforms[ "tDiffuse" ].value = readBuffer.texture;
      this.highPassUniforms[ "luminosityThreshold" ].value = this.threshold;
      this.quad.material = this.materialHighPassFilter;

      renderer.render( this.scene, this.camera, this.renderTargetBright, true );

      // 2. Blur All the mips progressively

      var inputRenderTarget = this.renderTargetBright;

      for ( var i = 0; i < this.nMips; i ++ ) {

        this.quad.material = this.separableBlurMaterials[ i ];

        this.separableBlurMaterials[ i ].uniforms[ "colorTexture" ].value = inputRenderTarget.texture;
        this.separableBlurMaterials[ i ].uniforms[ "direction" ].value = THREE.UnrealBloomPass.BlurDirectionX;
        renderer.render( this.scene, this.camera, this.renderTargetsHorizontal[ i ], true );

        this.separableBlurMaterials[ i ].uniforms[ "colorTexture" ].value = this.renderTargetsHorizontal[ i ].texture;
        this.separableBlurMaterials[ i ].uniforms[ "direction" ].value = THREE.UnrealBloomPass.BlurDirectionY;
        renderer.render( this.scene, this.camera, this.renderTargetsVertical[ i ], true );

        inputRenderTarget = this.renderTargetsVertical[ i ];

      }

      // Composite All the mips

      this.quad.material = this.compositeMaterial;
      this.compositeMaterial.uniforms[ "bloomStrength" ].value = this.strength;
      this.compositeMaterial.uniforms[ "bloomRadius" ].value = this.radius;
      this.compositeMaterial.uniforms[ "bloomTintColors" ].value = this.bloomTintColors;

      renderer.render( this.scene, this.camera, this.renderTargetsHorizontal[ 0 ], true );

      // Blend it additively over the input texture

      this.quad.material = this.materialCopy;
      this.copyUniforms[ "tDiffuse" ].value = this.renderTargetsHorizontal[ 0 ].texture;

      if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );


      if ( this.renderToScreen ) {

        renderer.render( this.scene, this.camera, undefined, false );

      } else {

        renderer.render( this.scene, this.camera, readBuffer, false );

      }

      // Restore renderer settings

      renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
      renderer.autoClear = oldAutoClear;

    },

    getSeperableBlurMaterial: function ( kernelRadius ) {

      return new THREE.ShaderMaterial( {

        defines: {
          "KERNEL_RADIUS": kernelRadius,
          "SIGMA": kernelRadius
        },

        uniforms: {
          "colorTexture": { value: null },
          "texSize": { value: new THREE.Vector2( 0.5, 0.5 ) },
          "direction": { value: new THREE.Vector2( 0.5, 0.5 ) }
        },

        vertexShader:
          "varying vec2 vUv;\n\
          void main() {\n\
            vUv = uv;\n\
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
          }",

        fragmentShader:
          "#include <common>\
          varying vec2 vUv;\n\
          uniform sampler2D colorTexture;\n\
          uniform vec2 texSize;\
          uniform vec2 direction;\
          \
          float gaussianPdf(in float x, in float sigma) {\
            return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\
          }\
          void main() {\n\
            vec2 invSize = 1.0 / texSize;\
            float fSigma = float(SIGMA);\
            float weightSum = gaussianPdf(0.0, fSigma);\
            vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;\
            for( int i = 1; i < KERNEL_RADIUS; i ++ ) {\
              float x = float(i);\
              float w = gaussianPdf(x, fSigma);\
              vec2 uvOffset = direction * invSize * x;\
              vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;\
              vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;\
              diffuseSum += (sample1 + sample2) * w;\
              weightSum += 2.0 * w;\
            }\
            gl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n\
          }"
      } );

    },

    getCompositeMaterial: function ( nMips ) {

      return new THREE.ShaderMaterial( {

        defines: {
          "NUM_MIPS": nMips
        },

        uniforms: {
          "blurTexture1": { value: null },
          "blurTexture2": { value: null },
          "blurTexture3": { value: null },
          "blurTexture4": { value: null },
          "blurTexture5": { value: null },
          "dirtTexture": { value: null },
          "bloomStrength": { value: 1.0 },
          "bloomFactors": { value: null },
          "bloomTintColors": { value: null },
          "bloomRadius": { value: 0.0 }
        },

        vertexShader:
          "varying vec2 vUv;\n\
          void main() {\n\
            vUv = uv;\n\
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
          }",

        fragmentShader:
          "varying vec2 vUv;\
          uniform sampler2D blurTexture1;\
          uniform sampler2D blurTexture2;\
          uniform sampler2D blurTexture3;\
          uniform sampler2D blurTexture4;\
          uniform sampler2D blurTexture5;\
          uniform sampler2D dirtTexture;\
          uniform float bloomStrength;\
          uniform float bloomRadius;\
          uniform float bloomFactors[NUM_MIPS];\
          uniform vec3 bloomTintColors[NUM_MIPS];\
          \
          float lerpBloomFactor(const in float factor) { \
            float mirrorFactor = 1.2 - factor;\
            return mix(factor, mirrorFactor, bloomRadius);\
          }\
          \
          void main() {\
            gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) + \
                             lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) + \
                             lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) + \
                             lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) + \
                             lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );\
          }"
      } );

    }

  } );

  THREE.UnrealBloomPass.BlurDirectionX = new THREE.Vector2( 1.0, 0.0 );
  THREE.UnrealBloomPass.BlurDirectionY = new THREE.Vector2( 0.0, 1.0 );

} )();

export { Shaders };
