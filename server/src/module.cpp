#include <napi.h>

#include <lote.hpp>

Napi::Value GetNapiVersion(const Napi::CallbackInfo &callback_info)
{
    const auto &env = callback_info.Env();
    return Napi::Number::New(env, NAPI_VERSION);
}

Napi::Value TestCppException(const Napi::CallbackInfo &callback_info)
{
    throw std::runtime_error("This is a test cpp exception");
}

Napi::Value Transcribe(const Napi::CallbackInfo &callback_info)
{
    const auto &env = callback_info.Env();
    const auto &model_path = callback_info[0].As<Napi::String>().Utf8Value();
    const auto &audio_data = callback_info[1].As<Napi::Buffer<float>>();
    return Napi::String::New(env, Transcribe(model_path, audio_data.Data(), audio_data.Length()));
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set(Napi::String::New(env, "getNapiVersion"), Napi::Function::New<GetNapiVersion>(env));
    exports.Set(Napi::String::New(env, "testCppException"), Napi::Function::New<TestCppException>(env));
    exports.Set(Napi::String::New(env, "transcribe"), Napi::Function::New<Transcribe>(env));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);
