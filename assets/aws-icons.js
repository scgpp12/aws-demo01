/* ============================================================
   AWS 官方风格 Resource Icon —— 内联 SVG 图标精灵(可跨页复用)
   风格:品牌色圆角方块 + 白色线性图标(对齐 AWS Architecture Icons 视觉规范)
   用法:页面任意处用 <svg class="aws-icon"><use href="#aws-s3"/></svg>
        或在大图里 <use href="#aws-s3" x=".." y=".." width=".." height=".."/>
   品牌配色:S3 存储绿 #7AA116 / EC2 计算橙 #ED7100 /
            IAM 安全红 #DD344C / VPC 网络紫 #8C4FFF
   说明:用内联自绘 SVG(非外链官方资源),保证离线可用、风格统一、深色模式清晰。
   引入位置:放在 <body> 开头(早于使用 <use> 的内容)。
   ============================================================ */
(function () {
  var SPRITE =
    '<svg class="aws-sprite" aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden">' +
    '<defs>' +
      '<linearGradient id="awsg-s3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A6CE39"/><stop offset="1" stop-color="#7AA116"/></linearGradient>' +
      '<linearGradient id="awsg-ec2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F58536"/><stop offset="1" stop-color="#ED7100"/></linearGradient>' +
      '<linearGradient id="awsg-iam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8536A"/><stop offset="1" stop-color="#DD344C"/></linearGradient>' +
      '<linearGradient id="awsg-vpc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A472FF"/><stop offset="1" stop-color="#8C4FFF"/></linearGradient>' +
    '</defs>' +

    /* —— Amazon S3:桶 —— */
    '<symbol id="aws-s3" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="13" fill="url(#awsg-s3)"/>' +
      '<path d="M17,19 C17,23 47,23 47,19 L41.5,46 C41.3,47.6 40,48.5 38.5,48.5 L25.5,48.5 C24,48.5 22.7,47.6 22.5,46 Z" fill="#fff"/>' +
      '<ellipse cx="32" cy="19" rx="15" ry="4" fill="#fff"/>' +
      '<ellipse cx="32" cy="18.6" rx="10.5" ry="2.4" fill="url(#awsg-s3)"/>' +
      '<path d="M24,30 H40 M25,38 H39" stroke="url(#awsg-s3)" stroke-width="1.6" opacity=".7"/>' +
    '</symbol>' +

    /* —— Amazon EC2:芯片/算力 —— */
    '<symbol id="aws-ec2" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="13" fill="url(#awsg-ec2)"/>' +
      '<g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round">' +
        '<rect x="22" y="22" width="20" height="20" rx="2.5"/>' +
        '<rect x="27.5" y="27.5" width="9" height="9" rx="1.5"/>' +
        '<path d="M27,22v-4 M32,22v-4 M37,22v-4 M27,42v4 M32,42v4 M37,42v4 M22,27h-4 M22,32h-4 M22,37h-4 M42,27h4 M42,32h4 M42,37h4"/>' +
      '</g>' +
    '</symbol>' +

    /* —— AWS IAM:钥匙(访问权限) —— */
    '<symbol id="aws-iam" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="13" fill="url(#awsg-iam)"/>' +
      '<g fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="26" cy="26" r="7.5"/>' +
        '<path d="M31.2,31.2 L45,45 M41,41 L45,37 M37,37 L41,33"/>' +
      '</g>' +
    '</symbol>' +

    /* —— Amazon VPC:互联节点(网络) —— */
    '<symbol id="aws-vpc" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="13" fill="url(#awsg-vpc)"/>' +
      '<g stroke="#fff" stroke-width="2.6" fill="#fff">' +
        '<line x1="32" y1="21" x2="21" y2="42"/><line x1="32" y1="21" x2="43" y2="42"/><line x1="21" y1="42" x2="43" y2="42"/>' +
        '<circle cx="32" cy="21" r="4.6"/><circle cx="21" cy="42" r="4.6"/><circle cx="43" cy="42" r="4.6"/>' +
      '</g>' +
    '</symbol>' +
    '</svg>';

  function inject() {
    if (document.getElementById("aws-sprite-host")) return;
    var d = document.createElement("div");
    d.id = "aws-sprite-host";
    d.setAttribute("aria-hidden", "true");
    d.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    d.innerHTML = SPRITE;
    document.body.insertBefore(d, document.body.firstChild);
  }

  if (document.body) inject();
  else document.addEventListener("DOMContentLoaded", inject);
})();
