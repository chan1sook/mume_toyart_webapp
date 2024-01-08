import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  // await ethers.deployContract("MumeArtToyUtilityToken");

  const _MumeArtToyUtilityToken = await ethers.getContractFactory(
    "MumeArtToyUtilityToken"
  );
  const MumeArtToyUtilityToken = await _MumeArtToyUtilityToken.deploy(owner);
  console.log("Tx:", await MumeArtToyUtilityToken.getAddress());

  await MumeArtToyUtilityToken.waitForDeployment();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
