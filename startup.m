matlab.engine.shareEngine()
if matlab.engine.isEngineShared()
  display("Engine shared.")
else
  display("Engine is not shared.")
end